import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { DexTradingPageComponent } from './pages/dex-trading-page/dex-trading-page.component';
import { UserDashboardPageComponent } from './pages/user-dashboard-page/user-dashboard-page.component';
import { LaunchpadPageComponent } from './pages/launchpad-page/launchpad-page.component';
import { KycPageComponent } from './pages/kyc-page/kyc-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { TestnetPageComponent } from './pages/testnet-page/testnet-page.component';
import { LayoutComponent } from './shared/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'dex-trading', component: DexTradingPageComponent },
      { path: 'user-dashboard', component: UserDashboardPageComponent },
      { path: 'launchpad', component: LaunchpadPageComponent },
      { path: 'kyc', component: KycPageComponent },
      { path: 'analytics', component: AnalyticsPageComponent },
      { path: 'testnet', component: TestnetPageComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
