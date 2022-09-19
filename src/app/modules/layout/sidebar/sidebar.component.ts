import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor() { }

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = [
      // { label: 'Home', routerLink: '/dapp/dashboard', icon: 'pi pi-home' },
      { label: 'Portfolio', routerLink: '/dapp/portfolio', icon: 'pi pi-briefcase' },
      { label: 'Load', routerLink: '/dapp/load', icon: 'pi pi-mobile' },
      { label: 'Withdraw', routerLink: '/dapp/withdraw', icon: 'pi pi-credit-card' },
      { label: 'Swap', routerLink: '/dapp/swap', icon: 'pi pi-arrows-h' },
      { label: 'Stake', routerLink: '/dapp/stake', icon: 'pi pi-box' },
      // { label: 'Redeem', routerLink: '/dapp/redeem', icon: 'pi pi-money-bill' },
      { label: 'Pay', routerLink: '/dapp/pay', icon: 'pi pi-wallet' }
    ];
  }
}
