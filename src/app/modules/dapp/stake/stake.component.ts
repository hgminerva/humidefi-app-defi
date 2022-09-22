import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { Subscription } from 'rxjs';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { DecimalPipe } from '@angular/common';
import { ForexModel } from 'src/app/models/forex.model';
import { DexService } from 'src/app/services/dex/dex.service';
import { StakeModel } from 'src/app/models/stake.model';
import { CurrenciesModel } from 'src/app/models/currencies.model';
import { InvestmentsModel } from 'src/app/models/investments.model';
import { LumiContractService } from 'src/app/services/lumi-contract/lumi-contract.service';
import { LphpuContractService } from 'src/app/services/lphpu-contract/lphpu-contract.service';
import { RedeemModel } from 'src/app/models/redeem.model';
import { AppSettings } from 'src/app/app-settings';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  providers: [MessageService]
})
export class StakeComponent implements OnInit {

  stakeData: StakeModel = new StakeModel();

  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];
  isLoading: boolean = true;
  isInvestmentsLoading: boolean = true;
  total: string = "0";

  stakeProcessMessage: string = "";
  isStakeProcessed: boolean = false;
  isStakeError: boolean = false;
  stakeSubscription: Subscription = new Subscription;

  currencies: CurrenciesModel[] = [];
  selectedCurrency!: CurrenciesModel;

  redeemProcessMessage: string = "";
  isRedeemProcessed: boolean = false;
  isRedeemError: boolean = false;
  redeemSubscription: Subscription = new Subscription;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private lumiContractService: LumiContractService,
    private lphpuContractService: LphpuContractService,
    private forexService: ForexService,
    private messageService: MessageService,
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
  lumiInvestment: InvestmentsModel = new InvestmentsModel();
  lphpuInvestment: InvestmentsModel = new InvestmentsModel();

  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  showStakeDialog: boolean = false;
  isStakeDialogLoading: boolean = false;

  dexUmiBalance: number = 0;
  lumiTVL: number = 0;
  lumiAPR: number = 0;
  lumiIncome: number = 0;

  dexPhpuBalance: number = 0;
  lphpuTVL: number = 0;
  lphpuAPR: number = 0;
  lphpuIncome: number = 0;

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
        this.getDexUMIBalance();
      }
    );
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

    this.lumiInvestment = {
      ticker: ticker,
      name: name,
      price: price,
      balance: balance,
      interest: this.lumiIncome,
      value: price * balance
    };

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

    this.lphpuInvestment = {
      ticker: ticker,
      name: name,
      price: price,
      balance: balance,
      interest: this.lphpuIncome,
      value: price * balance
    };

    this.isInvestmentsLoading = false;
    this.getTotal();
  }

  async stake(): Promise<void> {
    if (this.sourceQuantity == 0) {
      this.messageService.add({ key: 'error-stake', severity: 'error', summary: 'Error', detail: 'Invalid quantity' });
    } else {
      this.showProcessDialog = true;

      this.isProcessing = true;
      this.stakeProcessMessage = "Processing..."
      this.isStakeProcessed = false;
      this.isStakeError = false;

      let keypair = localStorage.getItem("wallet-keypair") || "";
      let stake: StakeModel = {
        source: keypair,
        quantity: this.sourceQuantity,
        sourceTicker: this.selectedSourceToken
      };

      this.dexService.doLiquidityStake(stake);
      let stakeEventMessages = this.dexService.stakeEventMessages.asObservable();

      this.stakeSubscription = stakeEventMessages.subscribe(
        message => {
          if (message != null) {
            if (message.hasError == true) {
              this.isProcessing = false;
              this.stakeProcessMessage = message.message;
              this.isStakeProcessed = false;
              this.isStakeError = true;

              this.stakeSubscription.unsubscribe();
            } else {
              if (message.isFinalized != true) {
                this.stakeProcessMessage = message.message;
              } else {
                this.isProcessing = false;
                this.stakeProcessMessage = "Stake Complete!"
                this.isStakeProcessed = true;
                this.isStakeError = false;

                this.sourceQuantity = 0;
                this.showStakeDialog = false;

                this.stakeSubscription.unsubscribe();
                this.getDexUMIBalance();
              }
            }
          } else {
            this.isProcessing = false;
            this.stakeProcessMessage = "Somethings went wrong";
            this.isStakeProcessed = false;
            this.isStakeError = true;

            this.stakeSubscription.unsubscribe();
          }
        }
      );
    }
  }

  openStakeDialog(token: string): void {
    this.showStakeDialog = true;
    this.selectedSourceToken = token;
  }

  sourceQuantityOnBlur(event: any): void {
    this.stakeData.quantity = this.sourceQuantity;
  }

  currencyOnChange(event: any): void {
    this.isInvestmentsLoading = true;
    this.getForex();
  }

  getTotal(): void {
    let total = this.lumiInvestment.value + this.lphpuInvestment.value;

    this.total = this.decimalPipe.transform(total, "1.5-5") || "0";
    this.isLoading = false;
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

    this.redeemSubscription = redeemEventMessages.subscribe(
      message => {
        if (message != null) {
          if (message.hasError == true) {
            this.isProcessing = false;
            this.redeemProcessMessage = message.message;
            this.isRedeemProcessed = false;
            this.isRedeemError = true;

            this.redeemSubscription.unsubscribe();
          } else {
            if (message.isFinalized != true) {
              this.redeemProcessMessage = message.message;
            } else {
              this.isProcessing = false;
              this.redeemProcessMessage = "Redeem Complete!"
              this.isRedeemProcessed = true;
              this.isRedeemError = false;

              this.redeemSubscription.unsubscribe();

              this.isLoading = true;
              this.getDexUMIBalance();
            }
          }
        } else {
          this.isProcessing = false;
          this.redeemProcessMessage = "Somethings went wrong";
          this.isRedeemProcessed = false;
          this.isRedeemError = true;

          this.redeemSubscription.unsubscribe();
        }
      }
    );
  }

  ngOnInit(): void {
    this.getForex();
  }

}
