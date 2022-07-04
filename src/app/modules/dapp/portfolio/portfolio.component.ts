import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CurrenciesModel } from 'src/app/models/currencies.model';
import { HoldingsModel } from 'src/app/models/holdings.model';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
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

  isLoading: boolean = true;
  isHoldingsLoading: boolean = true;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private appSettings: AppSettings
  ) {
    this.currencies = [
      { name: 'PHP' },
      { name: 'USD' }
    ];
    this.selectedCurrency = this.currencies[0];
  }

  holdings: HoldingsModel[] = [];
  total: string = "";

  displayChangeAccountDialog: boolean = false;

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  async getChainTokens(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    let chainTokens: Promise<string[]> = this.polkadotService.getChainTokens(keypair);
    let chainBalance: Promise<string> = this.polkadotService.getBalance(keypair);

    if ((await chainTokens).length > 0) {
      let ticker = (await chainTokens)[0];

      let name = "";
      if (ticker == "UMI") {
        name = "UMI Token";
      }

      let price = 0;
      let selectedCurrency = this.appSettings.currencies.filter(d => d.currency == this.selectedCurrency.name)[0];
      if (selectedCurrency != null) {
        let tokenPrice = selectedCurrency.tokensPrices.filter(d => d.token == ticker)[0];
        if (tokenPrice != null) {
          price = tokenPrice.price;
        }
      }

      let balance = parseFloat((this.decimalPipe.transform((await chainBalance), "1.5-5") || "0").replace(/,/g, ''));

      this.holdings.push({
        ticker: ticker,
        name: name,
        price: price,
        balance: balance,
        value: price * balance
      });
    }

    this.getPHPUContractSymbol();
  }

  async getPHPUContractSymbol(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    let prop = await this.phpuContractService.getProperties();
    let phpuContractBalance = await this.phpuContractService.balanceOf(keypair, keypair);

    if (prop != null) {
      let ticker = String(prop.symbol);
      let name = String(prop.name);

      let price = 0;
      let selectedCurrency = this.appSettings.currencies.filter(d => d.currency == this.selectedCurrency.name)[0];
      if (selectedCurrency != null) {
        let tokenPrice = selectedCurrency.tokensPrices.filter(d => d.token == ticker)[0];
        if (tokenPrice != null) {
          price = tokenPrice.price;
        }
      }

      let balance = parseFloat((this.decimalPipe.transform((await phpuContractBalance), "1.5-5") || "0").replace(/,/g, ''));

      this.holdings.push({
        ticker: ticker,
        name: name,
        price: price,
        balance: balance,
        value: price * balance
      });
    }

    this.getTotal();
  }

  getTotal(): void {
    let total = 0;

    if (this.holdings.length > 0) {
      for (let i = 0; i < this.holdings.length; i++) {
        total += this.holdings[i].value;
      }
    }

    this.total = this.decimalPipe.transform(total, "1.5-5") || "0";

    this.isLoading = false;
    this.isHoldingsLoading = false;
  }

  currencyOnChange(event: any): void {
    this.isHoldingsLoading = true;
    this.holdings = [];

    this.getChainTokens();
  }

  ngOnInit(): void {
    this.getChainTokens();
  }
}
