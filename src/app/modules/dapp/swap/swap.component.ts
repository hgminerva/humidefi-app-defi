import { Component, OnInit } from '@angular/core';
import { Hash } from '@polkadot/types/interfaces';
import { MessageService } from 'primeng/api';
import { AppSettings } from 'src/app/app-settings';
import { TransferModel } from 'src/app/models/transfer.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { Subscription } from 'rxjs';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { DecimalPipe } from '@angular/common';
import { ForexModel } from 'src/app/models/forex.model';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  providers: [MessageService]
})
export class SwapComponent implements OnInit {

  sourceTransferData: TransferModel = new TransferModel();
  destinationTransferData: TransferModel = new TransferModel();

  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];
  isLoading: boolean = true;

  swapProcessMessage: string = "";
  isSwapProcessed: boolean = false;
  isSwapError: boolean = false;

  sourceTransferMessageSubscription: Subscription = new Subscription;
  destinationTransferMessageSubscription: Subscription = new Subscription;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private forexService: ForexService,
    private messageService: MessageService
  ) { }

  forex: ForexModel = new ForexModel();

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";
  destinationQuantity: number = 0;

  treasuryAddress: string = "5Cd3jxxrjCLfecepuxmjQ1efttT3RWx3BWp5x8gHECfoNVmo";

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

    if ((await chainTokens).length > 0) {
      this.sourceTokens = (await chainTokens);
      this.selectedSourceToken = this.sourceTokens[0];

      this.destinationTokens = (await chainTokens);
      this.selectedDestinationToken = this.destinationTokens[0];
    }

    this.getPHPUContractSymbol();
  }

  async getPHPUContractSymbol(): Promise<void> {
    let prop = await this.phpuContractService.getProperties();
    if (prop != null) {
      let ticker = String(prop.symbol);
      this.sourceTokens.push(ticker);
    }

    this.isLoading = false;
  }

  async swap(): Promise<void> {
    if (this.selectedSourceToken == this.selectedDestinationToken) {
      this.messageService.add({ key: 'error-swap', severity: 'error', summary: 'Error', detail: 'Source token and destination token must not be the same' });
    } else {
      this.showProcessDialog = true;
      this.transferFromSource();
    }
  }

  async transferFromSource(): Promise<void> {
    this.isProcessing = true;
    this.swapProcessMessage = "Processing transfer from the selected source token..."
    this.isSwapProcessed = false;
    this.isSwapError = false;

    let keypair = localStorage.getItem("wallet-keypair") || "";
    this.sourceTransferData.keypair = keypair;
    this.sourceTransferData.recipient = this.treasuryAddress;
    this.sourceTransferData.amount = this.sourceQuantity;
    let transferEventMessages = this.polkadotService.transferEventMessages.asObservable();

    if (this.selectedSourceToken == 'UMI') {
      this.polkadotService.transfer(this.sourceTransferData);
      transferEventMessages = this.polkadotService.transferEventMessages.asObservable();
    }

    if (this.selectedSourceToken == 'PHPU') {
      this.phpuContractService.transfer(this.sourceTransferData);
      transferEventMessages = this.phpuContractService.transferEventMessages.asObservable();
    }

    this.sourceTransferMessageSubscription = transferEventMessages.subscribe(
      message => {
        if (message != null) {
          if (message.hasError == true) {
            this.isProcessing = false;
            this.swapProcessMessage = message.message;
            this.isSwapProcessed = false;
            this.isSwapError = true;

            this.sourceTransferMessageSubscription.unsubscribe();
          } else {
            if (message.isFinalized != true) {
              this.swapProcessMessage = message.message;
            } else {
              this.swapProcessMessage = "Source token transfer processed!"
              this.sourceTransferMessageSubscription.unsubscribe();

              setTimeout(() => {
                this.swapProcessMessage = "Processing transfer from the selected destination token..."
                this.transferFromDestination();
              }, 1000);
            }
          }
        } else {
          this.isProcessing = false;
          this.swapProcessMessage = "Somethings went wrong";
          this.isSwapProcessed = false;
          this.isSwapError = true;

          this.sourceTransferMessageSubscription.unsubscribe();
        }
      }
    );
  }

  async transferFromDestination(): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";
    this.destinationTransferData.keypair = this.treasuryAddress;
    this.destinationTransferData.recipient = keypair;
    this.destinationTransferData.amount = this.destinationQuantity;
    let transferEventMessages = this.polkadotService.transferEventMessages.asObservable();

    if (this.selectedDestinationToken == 'UMI') {
      this.polkadotService.transfer(this.destinationTransferData);
      transferEventMessages = this.polkadotService.transferEventMessages.asObservable();
    }

    if (this.selectedDestinationToken == 'PHPU') {
      this.phpuContractService.transfer(this.destinationTransferData);
      transferEventMessages = this.phpuContractService.transferEventMessages.asObservable();
    }

    this.destinationTransferMessageSubscription = transferEventMessages.subscribe(
      message => {
        if (message != null) {
          if (message.hasError == true) {
            this.isProcessing = false;
            this.swapProcessMessage = message.message;
            this.isSwapProcessed = false;
            this.isSwapError = true;

            this.destinationTransferMessageSubscription.unsubscribe();
          } else {
            if (message.isFinalized != true) {
              this.swapProcessMessage = message.message;
            } else {
              this.swapProcessMessage = "Destination token transfer processed!"

              setTimeout(() => {
                this.isProcessing = false;
                this.swapProcessMessage = "Swap Complete!"
                this.isSwapProcessed = true;
                this.isSwapError = false;

                this.sourceTransferData.keypair = "";
                this.sourceTransferData.recipient = "";
                this.sourceTransferData.amount = 0;
                this.sourceQuantity = 0;

                this.destinationTransferData.keypair = "";
                this.destinationTransferData.recipient = "";
                this.destinationTransferData.amount = 0;
                this.destinationQuantity = 0;

                this.destinationTransferMessageSubscription.unsubscribe();
              }, 1000);
            }
          }
        } else {
          this.isProcessing = false;
          this.swapProcessMessage = "Somethings went wrong";
          this.isSwapProcessed = false;
          this.isSwapError = true;

          this.destinationTransferMessageSubscription.unsubscribe();
        }
      }
    );
  }

  sourceTickerOnChange(event: any): void {
    this.selectedDestinationToken = this.selectedSourceToken;
    this.computeDestinationQuantity();
  }

  sourceQuantityOnBlur(event: any): void {
    this.sourceTransferData.amount = this.sourceQuantity;
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
