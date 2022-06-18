import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { WalletModule } from './../wallet/wallet.module';

import { CardModule } from 'primeng/card';

import { HomeComponent } from './home.component';
import { ConnectWalletComponent } from './connect-wallet/connect-wallet.component';

@NgModule({
  declarations: [
    HomeComponent,
    ConnectWalletComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    WalletModule,
    CardModule
  ]
})
export class HomeModule { }
