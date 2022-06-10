import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DappRoutingModule } from './dapp-routing.module';
import { LayoutModule } from '../layout/layout.module';

import { DappComponent } from './dapp.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { LoadBridgeComponent } from './load-bridge/load-bridge.component';
import { LoadPurchaseComponent } from './load-purchase/load-purchase.component';
import { SwapComponent } from './swap/swap.component';
import { StakeComponent } from './stake/stake.component';
import { WithdrawComponent } from './withdraw/withdraw.component';

@NgModule({
  declarations: [
    DappComponent,
    DashboardComponent,
    PortfolioComponent,
    LoadBridgeComponent,
    LoadPurchaseComponent,
    SwapComponent,
    StakeComponent,
    WithdrawComponent
  ],
  imports: [
    CommonModule,
    DappRoutingModule,
    LayoutModule
  ]
})
export class DappModule { }
