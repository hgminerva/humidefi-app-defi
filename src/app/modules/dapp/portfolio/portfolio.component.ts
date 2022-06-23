import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

interface SourceNetwork {
  name: string,
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  sourceNetworks: SourceNetwork[];

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService
  ) {
    this.sourceNetworks = [
      { name: 'UMI' }
    ];
  }

  balance: string = "";
  holdings: any = [];

  displayChangeAccountDialog: boolean = false;

  async getBalance(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";
    let balance: Promise<string> = this.polkadotService.getBalance(keypair);

    this.balance = this.decimalPipe.transform((await balance), "1.2-2") || "0";
  }

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  ngOnInit(): void {
    this.getBalance();
  }
}
