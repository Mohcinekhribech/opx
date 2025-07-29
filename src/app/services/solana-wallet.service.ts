import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Connection, PublicKey, clusterApiUrl, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

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

  /**
   * Get all token accounts for the connected wallet
   * @param pubkey Public key of the wallet
   * @returns Array of token account information
   */
  async getTokenAccounts(pubkey: PublicKey): Promise<any[]> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: TOKEN_PROGRAM_ID
      });
      
      return tokenAccounts.value.map(account => ({
        address: account.pubkey.toBase58(),
        mint: account.account.data.parsed.info.mint,
        balance: Number(account.account.data.parsed.info.tokenAmount.uiAmount),
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error: any) {
      console.warn('Failed to fetch token accounts:', error.message);
      return [];
    }
  }

  /**
   * Create an associated token account for a given mint
   * @param mint Public key of the token mint
   * @param owner Public key of the token account owner
   * @returns Public key of the created associated token account
   */
  async createAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    try {
      const associatedTokenAddress = await this.getAssociatedTokenAddress(mint, owner);
      
      // Check if account already exists
      const accountInfo = await this.connection.getAccountInfo(associatedTokenAddress);
      if (accountInfo) {
        return associatedTokenAddress;
      }
      
      // Create the associated token account
      const transaction = new Transaction().add(
        this.createAssociatedTokenAccountInstruction(
          owner,
          associatedTokenAddress,
          owner,
          mint
        )
      );
      
      // Sign and send transaction
      const signature = await this.provider.sendAndConfirm(transaction);
      console.log('Associated token account created:', signature);
      
      return associatedTokenAddress;
    } catch (error: any) {
      console.error('Failed to create associated token account:', error);
      throw error;
    }
  }

  /**
   * Get the associated token address for a mint and owner
   * @param mint Public key of the token mint
   * @param owner Public key of the token account owner
   * @returns Public key of the associated token account
   */
  private async getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    const [associatedTokenAddress] = await PublicKey.findProgramAddress(
      [
        owner.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return associatedTokenAddress;
  }

  /**
   * Create an instruction to create an associated token account
   * @param payer Public key of the transaction payer
   * @param associatedToken Public key of the associated token account
   * @param owner Public key of the token account owner
   * @param mint Public key of the token mint
   * @returns Transaction instruction
   */
  private createAssociatedTokenAccountInstruction(
    payer: PublicKey,
    associatedToken: PublicKey,
    owner: PublicKey,
    mint: PublicKey
  ): TransactionInstruction {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.alloc(0),
    });
  }

  /**
   * Get recent transactions for a wallet
   * @param pubkey Public key of the wallet
   * @param limit Number of transactions to fetch
   * @returns Array of transaction signatures
   */
  async getRecentTransactions(pubkey: PublicKey, limit: number = 20): Promise<string[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
      return signatures.map(sig => sig.signature);
    } catch (error: any) {
      console.warn('Failed to fetch recent transactions:', error.message);
      return [];
    }
  }

  /**
   * Get detailed transaction information
   * @param signature Transaction signature
   * @returns Transaction details
   */
  async getTransactionDetails(signature: string): Promise<any> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Handle different message versions
      let instructionCount = 0;
      if ('instructions' in transaction.transaction.message) {
        instructionCount = transaction.transaction.message.instructions.length;
      } else if ('compiledInstructions' in transaction.transaction.message) {
        instructionCount = transaction.transaction.message.compiledInstructions.length;
      }
      
      return {
        signature,
        status: transaction.meta?.err ? 'Failed' : 'Confirmed',
        fee: transaction.meta?.fee || 0,
        blockTime: transaction.blockTime,
        slot: transaction.slot,
        version: transaction.version,
        instructions: instructionCount
      };
    } catch (error: any) {
      console.warn('Failed to fetch transaction details:', error.message);
      throw error;
    }
  }

  /**
   * Get network status and health information
   * @returns Network status information
   */
  async getNetworkStatus(): Promise<any> {
    try {
      const startTime = Date.now();
      const slot = await this.connection.getSlot();
      const latency = Date.now() - startTime;
      
      const epochInfo = await this.connection.getEpochInfo();
      const lastBlockTime = await this.connection.getBlockTime(slot);
      
      return {
        status: 'Connected',
        healthy: latency < 5000, // Consider healthy if response time < 5 seconds
        latency,
        slot,
        epoch: epochInfo.epoch,
        lastBlockTime,
        network: 'testnet'
      };
    } catch (error: any) {
      console.warn('Failed to get network status:', error.message);
      return {
        status: 'Disconnected',
        healthy: false,
        latency: 0,
        slot: 0,
        epoch: 0,
        lastBlockTime: null,
        network: 'testnet'
      };
    }
  }

  /**
   * Get connection health information
   * @returns Connection health details
   */
  async getConnectionHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      const slot = await this.connection.getSlot();
      const latency = Date.now() - startTime;
      
      return {
        healthy: latency < 5000,
        latency,
        slot,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.warn('Failed to get connection health:', error.message);
      return {
        healthy: false,
        latency: 0,
        slot: 0,
        timestamp: Date.now()
      };
    }
  }
}
