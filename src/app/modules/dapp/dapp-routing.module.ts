import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DappComponent } from './dapp.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { LoadComponent } from './load/load.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { SwapComponent } from './swap/swap.component';
import { StakeComponent } from './stake/stake.component';
import { PayComponent } from './pay/pay.component';

const routes: Routes = [
  {
    path: '',
    component: DappComponent,
    children: [
      // { path: '', component: DashboardComponent },
      // { path: 'dashboard', component: DashboardComponent },
      { path: '', component: PortfolioComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'load', component: LoadComponent },
      { path: 'withdraw', component: WithdrawComponent },
      { path: 'swap', component: SwapComponent },
      { path: 'stake', component: StakeComponent },
      { path: 'pay', component: PayComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DappRoutingModule { }
