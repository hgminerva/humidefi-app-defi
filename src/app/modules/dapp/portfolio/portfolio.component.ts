import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CurrenciesModel } from 'src/app/models/currencies.model';
import { HoldingsModel } from 'src/app/models/holdings.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { AppSettings } from './../../../app-settings';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  currencies: CurrenciesModel[];
  selectedCurrency!: CurrenciesModel;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private appSettings: AppSettings
  ) {
    this.currencies = [
      { name: 'PHP' },
      { name: 'USD' }
    ];
    this.selectedCurrency = this.currencies[0];
  }

  balance: string = "";
  holdings: HoldingsModel[] = [];
  total: string = "";

  displayChangeAccountDialog: boolean = false;

  async getBalance(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";
    let balance: Promise<string> = this.polkadotService.getBalance(keypair);

    this.balance = this.decimalPipe.transform((await balance), "1.5-5") || "0";

    this.getHoldings();
  }

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  getHoldings(): void {
    this.holdings = [];
    let total = 0;

    let currencyPrices = this.appSettings.currencies.filter(d => d.currency == this.selectedCurrency.name)[0];
    if (currencyPrices != null) {
      let tokenPrices = currencyPrices.tokensPrices;
      if (tokenPrices.length > 0) {
        for (let i = 0; i < tokenPrices.length; i++) {
          let name = "";
          let balance = tokenPrices[i].token == 'UMI' ? parseFloat(this.balance.replace(/,/g, '')) : 0;

          switch (tokenPrices[i].token) {
            case 'UMI': name = "UMI Token"; break;
            case 'PHPU': name = "Stable Coin"; break;
            default: break;
          }

          this.holdings.push({
            ticker: tokenPrices[i].token,
            name: name,
            price: tokenPrices[i].price,
            balance: balance,
            value: tokenPrices[i].price * balance
          });

          total += tokenPrices[i].price * balance;
        }
      };
    }

    this.total = this.decimalPipe.transform(total, "1.5-5") || "0";
  }

  currencyOnChange(event: any): void {
    this.getHoldings();
  }

  ngOnInit(): void {
    this.getBalance();
  }
}
