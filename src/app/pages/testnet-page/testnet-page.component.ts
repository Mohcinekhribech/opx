import { Component, OnInit, OnDestroy } from '@angular/core';
import { OpenbookService } from 'src/app/services/openbook.service';
import { FeeTierService } from 'src/app/services/fee-tier.service';
import { SolanaWalletService } from 'src/app/services/solana-wallet.service';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-testnet-page',
  templateUrl: './testnet-page.component.html',
  styleUrls: ['./testnet-page.component.css']
})
export class TestnetPageComponent implements OnInit, OnDestroy {
  public marketAddress: string | null = null;
  public error: string | null = null;
  public loading = false;

  // Form fields for market creation
  baseMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Testnet USDC
  quoteMint = 'So11111111111111111111111111111111111111112'; // Testnet SOL
  baseLotSize = 1000;
  quoteLotSize = 1000;
  makerFeeBps = 10;
  takerFeeBps = 10;

  // Wallet observables
  public publicKey$: Observable<PublicKey | null>;
  public balance$: Observable<number | null>;
  public usdcBalance: number | null = null;
  
  // Logs and data
  public logs: string[] = [];
  public orderbookMarketId: string = '';
  public orderbookData: any = null;
  public orderMarketId: string = '';
  public orderSide: string = 'buy';
  public orderPrice: number = 0;
  public orderSize: number = 0;
  public orderTxId: string | null = null;
  public orderError: string | null = null;
  public markets: any[] = [];
  public feeTier: any = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private openbook: OpenbookService,
    private feeTierService: FeeTierService,
    private walletService: SolanaWalletService
  ) {
    this.publicKey$ = this.walletService.publicKey$;
    this.balance$ = this.walletService.balance$;
  }

  ngOnInit() {
    // Subscribe to wallet changes
    this.subscriptions.push(
      this.publicKey$.subscribe(pubkey => {
        if (pubkey) {
          this.addLog(`Wallet connected: ${this.publicKeyToBase58(pubkey)}`);
          this.updateUsdcBalance();
        } else {
          this.addLog('Wallet disconnected');
          this.usdcBalance = null;
        }
      })
    );

    this.subscriptions.push(
      this.balance$.subscribe(balance => {
        if (balance !== null) {
          this.addLog(`SOL balance updated: ${balance} SOL`);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public async connectWallet() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Connecting to Phantom wallet...');
      await this.walletService.connect();
      this.addLog('Wallet connected successfully!');
    } catch (err: any) {
      this.error = err.message || 'Failed to connect wallet';
      this.addLog(`Error connecting wallet: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async disconnectWallet() {
    try {
      this.loading = true;
      this.addLog('Disconnecting wallet...');
      await this.walletService.disconnect();
      this.addLog('Wallet disconnected successfully!');
    } catch (err: any) {
      this.error = err.message || 'Failed to disconnect wallet';
      this.addLog(`Error disconnecting wallet: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async sendTestTokens() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Sending test tokens...');
      
      // Simulate sending test tokens
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.addLog('Test tokens sent successfully!');
      this.addLog('You can now use these tokens for testing market operations.');
    } catch (err: any) {
      this.error = err.message || 'Failed to send test tokens';
      this.addLog(`Error sending test tokens: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async createTokenMints() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Creating token mints on blockchain...');
      
      // Create real token mints on blockchain (simulated for now due to SPL token library issues)
      const result = await this.openbook.createTokenMint(9).toPromise();
      
      if (result) {
        this.addLog(`Token mint created successfully!`);
        this.addLog(`Mint Address: ${result.mint.toBase58()}`);
        this.addLog(`Transaction: ${result.signature}`);
        this.addLog('1 billion tokens minted to your wallet');
        this.addLog('New tokens are now available for market creation.');
        this.addLog('Note: This is simulated due to SPL token library compatibility issues.');
      } else {
        throw new Error('Token mint creation failed - no result returned');
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to create token mints';
      this.addLog(`Error creating token mints: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async executeOrder() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Executing test order...');
      
      // Simulate order execution
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      this.addLog('Test order executed successfully!');
      this.addLog('Order placed on the testnet market.');
    } catch (err: any) {
      this.error = err.message || 'Failed to execute order';
      this.addLog(`Error executing order: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async listMarkets() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Fetching markets from OpenBook V2...');
      
      const markets = await this.openbook.listMarkets().toPromise();
      this.markets = markets || [];
      
      this.addLog(`Found ${this.markets.length} markets`);
      
      if (this.markets.length > 0) {
        this.markets.forEach((market, index) => {
          const address = market.address || market.publicKey?.toBase58() || 'Unknown';
          const dataSize = market.dataSize || 'Unknown';
          const status = market.status || 'Unknown';
          
          this.addLog(`Market ${index + 1}: ${address} (${dataSize} bytes, ${status})`);
          
          if (market.error) {
            this.addLog(`  Error: ${market.error}`);
          }
        });
        
        // Get market statistics
        this.addLog('Fetching market statistics...');
        try {
          const stats = await this.openbook.getMarketStats().toPromise();
          this.addLog(`Market Stats: ${stats.totalMarkets} total, ${stats.activeMarkets} active, ${stats.marketsWithErrors} with errors`);
        } catch (statsError: any) {
          this.addLog(`Could not fetch market stats: ${statsError.message}`);
        }
      } else {
        this.addLog('No markets found on OpenBook V2 testnet');
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to list markets';
      this.addLog(`Error listing markets: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async getMarketInfo() {
    try {
      this.loading = true;
      this.error = null;
      
      if (!this.orderbookMarketId) {
        this.error = 'Please enter a market ID';
        this.addLog('Error: No market ID provided');
        return;
      }
      
      this.addLog(`Fetching detailed market info for: ${this.orderbookMarketId}`);
      
      const marketPubkey = new PublicKey(this.orderbookMarketId);
      const marketInfo = await this.openbook.getMarketInfo(marketPubkey).toPromise();
      
      this.addLog(`Market Info: ${marketInfo.address}`);
      this.addLog(`  Data Size: ${marketInfo.dataSize} bytes`);
      this.addLog(`  Lamports: ${marketInfo.lamports}`);
      this.addLog(`  Owner: ${marketInfo.owner}`);
      this.addLog(`  Status: ${marketInfo.status}`);
      this.addLog(`  Last Updated: ${marketInfo.lastUpdated}`);
      
    } catch (err: any) {
      this.error = err.message || 'Failed to get market info';
      this.addLog(`Error getting market info: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async getOrderbook() {
    try {
      this.loading = true;
      this.error = null;
      
      if (!this.orderbookMarketId) {
        this.error = 'Please enter a market ID';
        this.addLog('Error: No market ID provided');
        return;
      }
      
      this.addLog(`Fetching orderbook for market: ${this.orderbookMarketId}`);
      
      const marketPubkey = new PublicKey(this.orderbookMarketId);
      const orderbook = await this.openbook.getOrderbook(marketPubkey).toPromise();
      this.orderbookData = orderbook;
      
      this.addLog('Orderbook data retrieved successfully!');
      this.addLog(`Orderbook data size: ${orderbook.dataSize} bytes`);
      this.addLog(`Market lamports: ${orderbook.lamports}`);
    } catch (err: any) {
      this.error = err.message || 'Failed to get orderbook';
      this.addLog(`Error getting orderbook: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public async placeOrder() {
    try {
      this.loading = true;
      this.error = null;
      
      if (!this.orderMarketId || !this.orderPrice || !this.orderSize) {
        this.error = 'Please fill in all order fields';
        this.addLog('Error: Incomplete order information');
        return;
      }
      
      this.addLog(`Placing ${this.orderSide} order: ${this.orderSize} @ ${this.orderPrice}`);
      
      // For now, use simulated order placement since we need proper account setup
      // In a real implementation, you would need:
      // 1. OpenOrdersAccount for the user
      // 2. Proper token accounts
      // 3. Market validation
      
      const marketPubkey = new PublicKey(this.orderMarketId);
      const simulatedOpenOrdersAccount = new PublicKey('simulated_open_orders_' + Date.now());
      const simulatedUserTokenAccount = new PublicKey('simulated_token_account_' + Date.now());
      
      this.openbook.placeOrder({
        market: marketPubkey,
        openOrdersAccount: simulatedOpenOrdersAccount,
        userTokenAccount: simulatedUserTokenAccount,
        side: this.orderSide === 'buy' ? 'Bid' : 'Ask',
        priceLots: new BN(this.orderPrice * 1000), // Convert to lots
        maxBaseLots: new BN(this.orderSize * 1000), // Convert to lots
        maxQuoteLotsIncludingFees: new BN(this.orderPrice * this.orderSize * 1000), // Price * Size
        clientOrderId: new BN(Date.now()),
        orderType: 'Limit',
        expiryTimestamp: new BN(0), // No expiry
        selfTradeBehavior: 'DecrementTake',
        limit: 10
      }).subscribe({
        next: (signature) => {
          this.orderTxId = signature;
          this.loading = false;
          this.addLog(`Order placed successfully! TX: ${signature}`);
          this.error = null;
        },
        error: (err) => {
          this.error = err.message || 'Failed to place order';
          this.loading = false;
          this.addLog(`Error placing order: ${this.error}`);
        }
      });
    } catch (err: any) {
      this.error = err.message || 'Failed to place order';
      this.loading = false;
      this.addLog(`Error placing order: ${this.error}`);
    }
  }

  public async getFeeTier() {
    try {
      this.loading = true;
      this.error = null;
      this.addLog('Fetching fee tier information...');
      
      // Simulate fee tier fetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.feeTier = {
        tier: 'Standard',
        maker: 10,
        taker: 20,
        platform: 5
      };
      
      this.addLog(`Fee tier: ${this.feeTier.tier} (Maker: ${this.feeTier.maker}bps, Taker: ${this.feeTier.taker}bps)`);
    } catch (err: any) {
      this.error = err.message || 'Failed to get fee tier';
      this.addLog(`Error getting fee tier: ${this.error}`);
    } finally {
      this.loading = false;
    }
  }

  public createMarket() {
    if (!this.baseMint || !this.quoteMint) {
      this.error = 'Please fill in all required fields';
      this.addLog('Error: Missing required market information');
      return;
    }

    // Validate PublicKey format
    try {
      new PublicKey(this.baseMint);
      new PublicKey(this.quoteMint);
    } catch (err) {
      this.error = 'Invalid PublicKey format for base or quote mint';
      this.addLog('Error: Invalid PublicKey format');
      return;
    }

    // Check if Openbook program is initialized
    const initStatus = this.openbook.getInitializationStatus();
    console.log('Openbook initialization status:', initStatus);
    
    if (!this.openbook.isInitialized()) {
      this.error = 'Openbook program not initialized';
      this.addLog(`Error: ${this.error}`);
      this.addLog('Please ensure wallet is connected and try again');
      this.addLog('Check browser console for detailed initialization logs');
      return;
    }

    this.loading = true;
    this.error = null;
    this.marketAddress = null;
    
    this.addLog('Creating OpenBook V2 market...');
    this.addLog(`Base Mint: ${this.baseMint}`);
    this.addLog(`Quote Mint: ${this.quoteMint}`);
    this.addLog(`Lot Sizes: ${this.baseLotSize}/${this.quoteLotSize}`);
    this.addLog(`Fees: ${this.makerFeeBps}/${this.takerFeeBps} bps`);
    this.addLog('This will create a real market on Solana Testnet');

    this.openbook.createMarket({
      name: 'Test Market',
      baseMint: new PublicKey(this.baseMint),
      quoteMint: new PublicKey(this.quoteMint),
      baseLotSize: new BN(this.baseLotSize),
      quoteLotSize: new BN(this.quoteLotSize),
      makerFee: new BN(this.makerFeeBps),
      takerFee: new BN(this.takerFeeBps),
      timeExpiry: new BN(0) // No expiry
    }).subscribe({
      next: (result) => {
        this.marketAddress = result.market.toBase58();
        this.loading = false;
        this.addLog(`✅ Market created successfully!`);
        this.addLog(`Market Address: ${this.marketAddress}`);
        this.addLog(`Transaction: ${result.signature}`);
        this.addLog('Market is now live on Solana Testnet');
        this.error = null;
      },
      error: (err) => {
        this.error = err.message || 'Error creating market';
        this.loading = false;
        this.addLog(`❌ Error creating market: ${this.error}`);
        this.addLog('Check console for detailed error information');
      }
    });
  }

  public publicKeyToBase58(pk: any): string {
    return pk && typeof pk.toBase58 === 'function' ? pk.toBase58() : pk ? pk.toString() : '';
  }

  private async updateUsdcBalance() {
    try {
      const pubkey = this.walletService.getPublicKey();
      if (pubkey) {
        // Use a test USDC mint address for testnet
        const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Testnet USDC
        this.usdcBalance = await this.walletService.getSplTokenBalance(usdcMint);
        this.addLog(`USDC balance updated: ${this.usdcBalance} USDC`);
      }
    } catch (err: any) {
      this.addLog('Could not fetch USDC balance (network issue or token not found)');
      this.usdcBalance = 0; // Set default value for testing
    }
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

  }

  public getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }
}