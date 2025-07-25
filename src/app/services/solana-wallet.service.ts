import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export type WalletProvider = 'Phantom'; // Extendable for multi-wallet

@Injectable({
  providedIn: 'root'
})
export class SolanaWalletService {
  // Use Solana testnet endpoint
  private connection = new Connection('https://api.testnet.solana.com', 'confirmed');
  private provider: any = null;
  private publicKeySubject = new BehaviorSubject<PublicKey | null>(null);
  public publicKey$ = this.publicKeySubject.asObservable();
  private balanceSubject = new BehaviorSubject<number | null>(null);
  public balance$ = this.balanceSubject.asObservable();

  constructor() {
    this.detectProvider();
  }

  private detectProvider() {
    if ((window as any).solana && (window as any).solana.isPhantom) {
      this.provider = (window as any).solana;
    } else {
      this.provider = null;
    }
  }

  async connect(): Promise<void> {
    if (!this.provider) {
      this.detectProvider();
      if (!this.provider) throw new Error('Phantom Wallet not found');
    }
    try {
      const resp = await this.provider.connect();
      const pubkey = new PublicKey(resp.publicKey.toString());
      this.publicKeySubject.next(pubkey);
      await this.updateBalance(pubkey);
    } catch (err) {
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider && this.provider.disconnect) {
      await this.provider.disconnect();
    }
    this.publicKeySubject.next(null);
    this.balanceSubject.next(null);
  }

  getPublicKey(): PublicKey | null {
    return this.publicKeySubject.value;
  }

  async updateBalance(pubkey?: PublicKey): Promise<void> {
    const key = pubkey || this.publicKeySubject.value;
    if (!key) {
      this.balanceSubject.next(null);
      return;
    }
    
    try {
      const balance = await this.connection.getBalance(key);
      this.balanceSubject.next(balance / 1e9); // Convert lamports to SOL
    } catch (error: any) {
      console.warn('Failed to fetch balance:', error.message);
      // Set a default balance for testing purposes
      this.balanceSubject.next(0);
    }
  }

  getBalance(): number | null {
    return this.balanceSubject.value;
  }

  /**
   * Fetch SPL token balance for the connected wallet
   * @param mintAddress SPL token mint address (e.g., USDC)
   * @returns balance in tokens (not lamports)
   */
  async getSplTokenBalance(mintAddress: string): Promise<number> {
    const pubkey = this.publicKeySubject.value;
    if (!pubkey) throw new Error('Wallet not connected');
    
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        mint: new PublicKey(mintAddress),
        programId: TOKEN_PROGRAM_ID
      });
      if (tokenAccounts.value.length === 0) return 0;
      const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount;
      return Number(amount.uiAmount);
    } catch (error: any) {
      console.warn('Failed to fetch SPL token balance:', error.message);
      // Return 0 for testing purposes
      return 0;
    }
  }
}
