import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DappRoutingModule } from './dapp-routing.module';
import { WalletModule } from './../wallet/wallet.module';
import { LayoutModule } from '../layout/layout.module';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';

import { DappComponent } from './dapp.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { LoadComponent } from './load/load.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { SwapComponent } from './swap/swap.component';
import { StakeComponent } from './stake/stake.component';
import { PayComponent } from './pay/pay.component';

@NgModule({
  declarations: [
    DappComponent,
    DashboardComponent,
    PortfolioComponent,
    LoadComponent,
    WithdrawComponent,
    SwapComponent,
    StakeComponent,
    PayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DappRoutingModule,
    WalletModule,
    LayoutModule,
    CardModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    DialogModule,
    ProgressSpinnerModule,
    TabViewModule
  ],
  providers: [
    DecimalPipe
  ]
})
export class DappModule { }
