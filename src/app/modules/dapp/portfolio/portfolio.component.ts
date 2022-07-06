import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CurrenciesModel } from 'src/app/models/currencies.model';
import { ForexModel } from 'src/app/models/forex.model';
import { HoldingsModel } from 'src/app/models/holdings.model';
import { ForexService } from 'src/app/services/forex/forex.service';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

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
    private forexService: ForexService
  ) {
    this.currencies = [
      { name: 'PHP' },
      { name: 'USD' }
    ];
    this.selectedCurrency = this.currencies[0];
  }

  forex: ForexModel = new ForexModel();

  holdings: HoldingsModel[] = [];
  total: string = "";

  displayChangeAccountDialog: boolean = false;

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  getForex(): void {
    this.forexService.getRates().subscribe(
      data => {
        if (data != new ForexModel()) {
          this.forex = {
            success: data.success,
            timestamp: data.timestamp,
            base: data.base,
            date: data.date,
            rates: {
              PHP: data.rates.PHP,
              USD: data.rates.USD
            }
          };
        }

        this.getChainTokens();
      }
    );
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

      let price = 1;
      if (this.selectedCurrency.name == 'PHP') {
        price = parseFloat((this.decimalPipe.transform(this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
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
    let phpuContractBalance = await this.phpuContractService.balanceOf(keypair);

    if (prop != null) {
      let ticker = String(prop.symbol);
      let name = String(prop.name);

      let price = 1;
      if (this.selectedCurrency.name == 'USD') {
        price = parseFloat((this.decimalPipe.transform(this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
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

    this.getForex();
  }

  ngOnInit(): void {
    this.getForex();
  }
}
