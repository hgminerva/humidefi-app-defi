import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DappRoutingModule } from './dapp-routing.module';

import { DappComponent } from './dapp.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    DappComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DappRoutingModule
  ]
})
export class DappModule { }
