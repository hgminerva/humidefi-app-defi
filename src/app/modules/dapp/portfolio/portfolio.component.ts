import { Component, OnInit } from '@angular/core';
import { ApiPromise, WsProvider } from '@polkadot/api';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  constructor() { }

  walletMetaName: string = "";
  walletKeyPair: string = "";
  balance: string = "";

  holdings: any = [];

  async getBalances(): Promise<void> {
    const wsProvider = new WsProvider('wss://humidefi-node1.liteclerk.com:443');
    const api = await ApiPromise.create({ provider: wsProvider });

    const now = await api.query.timestamp.now();

    // Retrieve the account balance & nonce via the system module
    const { nonce, data: balance } = await api.query.system.account(this.walletKeyPair);
    this.balance = (parseFloat(balance.free.toString()) / 1000000000000).toString();

    console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);
  }

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
  
    this.getBalances();
  }

}
