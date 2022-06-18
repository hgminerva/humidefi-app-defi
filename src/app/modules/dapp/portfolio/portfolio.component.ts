import { Component, OnInit } from '@angular/core';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService
  ) { }

  balance: string = "";
  holdings: any = [];

  displayChangeAccountDialog: boolean = false;

  async getBalance(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";
    let balance: Promise<string> = this.polkadotService.getBalance(keypair);
    this.balance = (await balance);
  }

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  ngOnInit(): void {
    this.getBalance();
  }
}
