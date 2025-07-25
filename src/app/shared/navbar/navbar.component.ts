import { Component } from '@angular/core';
import { SolanaWalletService } from 'src/app/services/solana-wallet.service';
import { Observable } from 'rxjs';
import { PublicKey } from '@solana/web3.js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public publicKey$: Observable<PublicKey | null>;
  public balance$: Observable<number | null>;
  public loading = false;
  public error: string | null = null;
  public isMobileMenuOpen = false;

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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevent body scroll when mobile menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }
}
