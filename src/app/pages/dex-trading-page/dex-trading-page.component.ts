import { Component } from '@angular/core';
import { SolanaWalletService } from 'src/app/services/solana-wallet.service';
import { Observable } from 'rxjs';
import { PublicKey } from '@solana/web3.js';

@Component({
  selector: 'app-dex-trading-page',
  templateUrl: './dex-trading-page.component.html',
  styleUrls: ['./dex-trading-page.component.css']
})
export class DexTradingPageComponent {
  public publicKey$: Observable<PublicKey | null>;
  public balance$: Observable<number | null>;
  public loading = false;
  public error: string | null = null;
  public showToast = false;
  public expandedPoolCard: number | null = null;

  constructor(private walletService: SolanaWalletService) {
    this.publicKey$ = this.walletService.publicKey$;
    this.balance$ = this.walletService.balance$;
  }

  async connectWallet() {
    this.loading = true;
    this.error = null;
    try {
      await this.walletService.connect();
    } catch (err: any) {
      this.error = err.message || 'Failed to connect wallet';
    }
    this.loading = false;
  }

  async disconnectWallet() {
    this.loading = true;
    this.error = null;
    try {
      await this.walletService.disconnect();
    } catch (err: any) {
      this.error = err.message || 'Failed to disconnect wallet';
    }
    this.loading = false;
  }

  expandPoolCard(index: number) {
    this.expandedPoolCard = this.expandedPoolCard === index ? null : index;
  }

  // Example: Call this in (click) handlers for Swap, Provide Liquidity, Manage Pool
  triggerToast() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 2000);
  }
}
