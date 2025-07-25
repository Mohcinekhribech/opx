import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { DexTradingPageComponent } from './pages/dex-trading-page/dex-trading-page.component';
import { UserDashboardPageComponent } from './pages/user-dashboard-page/user-dashboard-page.component';
import { LaunchpadPageComponent } from './pages/launchpad-page/launchpad-page.component';
import { KycPageComponent } from './pages/kyc-page/kyc-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { TestnetPageComponent } from './pages/testnet-page/testnet-page.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { WalletConnectComponent } from './shared/wallet-connect/wallet-connect.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    DexTradingPageComponent,
    UserDashboardPageComponent,
    LaunchpadPageComponent,
    KycPageComponent,
    AnalyticsPageComponent,
    TestnetPageComponent,
    NavbarComponent,
    LayoutComponent,
    WalletConnectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
