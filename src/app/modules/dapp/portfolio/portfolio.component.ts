import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppSettings } from 'src/app/app-settings';
import { CurrenciesModel } from 'src/app/models/currencies.model';
import { ForexModel } from 'src/app/models/forex.model';
import { HoldingsModel } from 'src/app/models/holdings.model';
import { InvestmentsModel } from 'src/app/models/investments.model';
import { RedeemModel } from 'src/app/models/redeem.model';
import { DexService } from 'src/app/services/dex/dex.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { LphpuContractService } from 'src/app/services/lphpu-contract/lphpu-contract.service';
import { LumiContractService } from 'src/app/services/lumi-contract/lumi-contract.service';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  providers: [MessageService]
})
export class PortfolioComponent implements OnInit {

  currencies: CurrenciesModel[];
  selectedCurrency!: CurrenciesModel;

  isLoading: boolean = true;
  isHoldingsLoading: boolean = true;
  isInvestmentsLoading: boolean = true;

  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  redeemProcessMessage: string = "";
  isRedeemProcessed: boolean = false;
  isRedeemError: boolean = false;
  subscription: Subscription = new Subscription;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private lumiContractService: LumiContractService,
    private lphpuContractService: LphpuContractService,
    private forexService: ForexService,
    private dexService: DexService,
    private appSettings: AppSettings
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
  investments: InvestmentsModel[] = [];

  displayChangeAccountDialog: boolean = false;

  dexUmiBalance: number = 0;
  lumiTVL: number = 0;
  lumiAPR: number = 0;
  lumiIncome: number = 0;

  dexPhpuBalance: number = 0;
  lphpuTVL: number = 0;
  lphpuAPR: number = 0;
  lphpuIncome: number = 0;

  changeAccount(): void {
    this.displayChangeAccountDialog = true;
  }

  getForex(): void {
    this.forexService.getRates(this.selectedCurrency.name).subscribe(
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

        this.isLoading = false;

        this.getChainTokens();
        this.getDexUMIBalance();
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
        price = parseFloat((this.decimalPipe.transform(1 / this.forex.rates.USD, "1.5-5") || "0").replace(/,/g, ''));
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

    let propSymbol = await this.phpuContractService.symbol();
    let propName = await this.phpuContractService.name();
    let phpuContractBalance = await this.phpuContractService.psp22BalanceOf(keypair);

    let ticker = String(propSymbol);
    let name = String(propName);

    let price = 1;
    if (this.selectedCurrency.name == 'USD') {
      price = parseFloat((this.decimalPipe.transform(1 / this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
    }

    let balance = parseFloat((this.decimalPipe.transform(phpuContractBalance, "1.5-5") || "0").replace(/,/g, ''));

    this.holdings.push({
      ticker: ticker,
      name: name,
      price: price,
      balance: balance,
      value: price * balance
    });

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
    this.isHoldingsLoading = false;
  }

  async getDexUMIBalance(): Promise<void> {
    let keypair = this.appSettings.dexAccount;
    let chainBalance: Promise<string> = this.polkadotService.getBalance(keypair);

    let balance = parseFloat((this.decimalPipe.transform((await chainBalance), "1.5-5") || "0").replace(/,/g, ''));
    this.dexUmiBalance = balance;

    this.getDexPHPUBalance();
  }

  async getDexPHPUBalance(): Promise<void> {
    let keypair = this.appSettings.dexAccount;
    let phpuContractBalance = await this.phpuContractService.psp22BalanceOf(keypair);

    let balance = parseFloat((this.decimalPipe.transform(phpuContractBalance, "1.5-5") || "0").replace(/,/g, ''));
    this.dexPhpuBalance = balance;

    this.getLUMIContractSymbol();
  }

  async getLUMIContractSymbol(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    let propSymbol = await this.lumiContractService.symbol();
    let propName = await this.lumiContractService.name();
    let lumiContractBalance = await this.lumiContractService.psp22BalanceOf(keypair);

    let ticker = String(propSymbol);
    let name = String(propName);

    let price = 1;
    if (this.selectedCurrency.name == 'PHP') {
      price = parseFloat((this.decimalPipe.transform(1 / this.forex.rates.USD, "1.5-5") || "0").replace(/,/g, ''));
    }

    let balance = parseFloat((this.decimalPipe.transform(lumiContractBalance, "1.5-5") || "0").replace(/,/g, ''));

    this.lumiTVL = await this.lumiContractService.psp22TotalSupply();
    this.lumiAPR = (balance / this.lumiTVL) * 100;
    this.lumiIncome = this.dexUmiBalance * (this.lumiAPR / 100);

    this.investments.push({
      ticker: ticker,
      name: name,
      price: price,
      balance: balance,
      interest: this.lumiIncome,
      value: price * balance
    });

    this.getLPHPUContractSymbol();
  }

  async getLPHPUContractSymbol(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    let propSymbol = await this.lphpuContractService.symbol();
    let propName = await this.lphpuContractService.name();
    let lphpuContractBalance = await this.lphpuContractService.psp22BalanceOf(keypair);

    let ticker = String(propSymbol);
    let name = String(propName);

    let price = 1;
    if (this.selectedCurrency.name == 'USD') {
      price = parseFloat((this.decimalPipe.transform(1 / this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
    }

    let balance = parseFloat((this.decimalPipe.transform(lphpuContractBalance, "1.5-5") || "0").replace(/,/g, ''));

    this.lphpuTVL = await this.lphpuContractService.psp22TotalSupply();
    this.lphpuAPR = (balance / this.lphpuTVL) * 100;
    this.lphpuIncome = this.dexPhpuBalance * (this.lphpuAPR / 100);

    this.investments.push({
      ticker: ticker,
      name: name,
      price: price,
      balance: balance,
      interest: this.lphpuIncome,
      value: price * balance
    });

    this.isInvestmentsLoading = false;
  }

  currencyOnChange(event: any): void {
    this.isHoldingsLoading = true;
    this.isInvestmentsLoading = true;

    this.holdings = [];
    this.investments = [];

    this.getForex();
  }

  redeem(quantity: number, token: string): void {
    this.showProcessDialog = true;

    this.isProcessing = true;
    this.redeemProcessMessage = "Processing..."
    this.isRedeemProcessed = false;
    this.isRedeemError = false;

    let keypair = localStorage.getItem("wallet-keypair") || "";
    let redeem: RedeemModel = {
      source: keypair,
      quantity: quantity,
      sourceTicker: token
    };

    this.dexService.doLiquidityRedeem(redeem);
    let redeemEventMessages = this.dexService.redeemEventMessages.asObservable();

    this.subscription = redeemEventMessages.subscribe(
      message => {
        if (message != null) {
          if (message.hasError == true) {
            this.isProcessing = false;
            this.redeemProcessMessage = message.message;
            this.isRedeemProcessed = false;
            this.isRedeemError = true;

            this.subscription.unsubscribe();
          } else {
            if (message.isFinalized != true) {
              this.redeemProcessMessage = message.message;
            } else {
              this.isProcessing = false;
              this.redeemProcessMessage = "Redeem Complete!"
              this.isRedeemProcessed = true;
              this.isRedeemError = false;

              this.subscription.unsubscribe();

              this.isInvestmentsLoading = true;
              this.investments = [];
              this.getDexUMIBalance();
            }
          }
        } else {
          this.isProcessing = false;
          this.redeemProcessMessage = "Somethings went wrong";
          this.isRedeemProcessed = false;
          this.isRedeemError = true;

          this.subscription.unsubscribe();
        }
      }
    );
  }

  ngOnInit(): void {
    this.getForex();
  }
}
