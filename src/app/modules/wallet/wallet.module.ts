import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WalletRoutingModule } from './wallet-routing.module';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { SafePipe } from './../../pipes/safe.pipe';
import { WalletComponent } from './wallet.component';
import { WalletInfoComponent } from './wallet-info/wallet-info.component';

@NgModule({
  declarations: [
    SafePipe,
    WalletComponent,
    WalletInfoComponent
  ],
  imports: [
    CommonModule,
    WalletRoutingModule,
    ButtonModule,
    TableModule
  ],
  exports: [
    WalletComponent,
    WalletInfoComponent
  ]
})
export class WalletModule { }
