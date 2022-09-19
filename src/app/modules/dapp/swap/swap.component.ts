import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { Subscription } from 'rxjs';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { DecimalPipe } from '@angular/common';
import { ForexModel } from 'src/app/models/forex.model';
import { DexService } from 'src/app/services/dex/dex.service';
import { SwapModel } from 'src/app/models/swap.model';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  providers: [MessageService]
})
export class SwapComponent implements OnInit {

  swapData: SwapModel = new SwapModel();

  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];
  isLoading: boolean = true;

  swapProcessMessage: string = "";
  isSwapProcessed: boolean = false;
  isSwapError: boolean = false;
  subscription: Subscription = new Subscription;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private forexService: ForexService,
    private messageService: MessageService,
    private dexService: DexService
  ) { }

  forex: ForexModel = new ForexModel();

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";
  destinationQuantity: number = 0;

  getForex(): void {
    this.forexService.getRates("USD").subscribe(
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

    if ((await chainTokens).length > 0) {
      this.sourceTokens = (await chainTokens);
      this.selectedSourceToken = this.sourceTokens[0];

      this.destinationTokens = (await chainTokens);
      this.selectedDestinationToken = this.destinationTokens[0];
    }

    this.getPHPUContractSymbol();
  }

  async getPHPUContractSymbol(): Promise<void> {
    let propSymbol = await this.phpuContractService.symbol();
    let ticker = String(propSymbol);
    this.sourceTokens.push(ticker);

    this.isLoading = false;
  }

  async swap(): Promise<void> {
    if (this.selectedSourceToken == this.selectedDestinationToken) {
      this.messageService.add({ key: 'error-swap', severity: 'error', summary: 'Error', detail: 'Source token and destination token must not be the same' });
    } else {
      this.showProcessDialog = true;

      this.isProcessing = true;
      this.swapProcessMessage = "Processing..."
      this.isSwapProcessed = false;
      this.isSwapError = false;

      let keypair = localStorage.getItem("wallet-keypair") || "";
      this.dexService.doSwap(keypair, this.sourceQuantity, this.selectedSourceToken, this.selectedDestinationToken);
      let swapEventMessages = this.dexService.swapEventMessages.asObservable();

      this.subscription = swapEventMessages.subscribe(
        message => {
          if (message != null) {
            if (message.hasError == true) {
              this.isProcessing = false;
              this.swapProcessMessage = message.message;
              this.isSwapProcessed = false;
              this.isSwapError = true;

              this.subscription.unsubscribe();
            } else {
              if (message.isFinalized != true) {
                this.swapProcessMessage = message.message;
              } else {
                this.isProcessing = false;
                this.swapProcessMessage = "Swap Complete!"
                this.isSwapProcessed = true;
                this.isSwapError = false;

                this.sourceQuantity = 0;
                this.destinationQuantity = 0;

                this.subscription.unsubscribe();
              }
            }
          } else {
            this.isProcessing = false;
            this.swapProcessMessage = "Somethings went wrong";
            this.isSwapProcessed = false;
            this.isSwapError = true;

            this.subscription.unsubscribe();
          }
        }
      );
    }
  }

  sourceTickerOnChange(event: any): void {
    this.selectedDestinationToken = this.selectedSourceToken;
    this.computeDestinationQuantity();
  }

  sourceQuantityOnBlur(event: any): void {
    this.swapData.quantity = this.sourceQuantity;
    this.computeDestinationQuantity();
  }

  destinationTickerOnChange(event: any): void {
    this.computeDestinationQuantity();
  }

  computeDestinationQuantity(): void {
    let price = 1;

    if (this.selectedSourceToken == 'UMI' && this.selectedDestinationToken == 'PHPU') {
      price = parseFloat((this.decimalPipe.transform(this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
    }

    if (this.selectedSourceToken == 'PHPU' && this.selectedDestinationToken == 'UMI') {
      price = parseFloat((this.decimalPipe.transform(1 / this.forex.rates.PHP, "1.5-5") || "0").replace(/,/g, ''));
    }

    this.destinationQuantity = this.sourceQuantity * price;
  }

  ngOnInit(): void {
    this.getForex();
  }
}
