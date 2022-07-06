import { Component, OnInit } from '@angular/core';
import { Hash } from '@polkadot/types/interfaces';
import { MessageService } from 'primeng/api';
import { TransferModel } from 'src/app/models/transfer.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { Subscription } from 'rxjs';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { ForexModel } from 'src/app/models/forex.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss'],
  providers: [MessageService]
})
export class PayComponent implements OnInit {

  transferData: TransferModel = new TransferModel();
  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];
  isLoading: boolean = true;

  transferProcessMessage: string = "";
  isTransferProcessed: boolean = false;
  isTransferError: boolean = false;
  subscription: Subscription = new Subscription;

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

  async transfer(): Promise<void> {
    if (this.selectedSourceToken == '' || null) {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Please select token' });
    } else if (this.transferData.amount == 0 || null || '') {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Invalid amount' });
    } else if (this.transferData.recipient == '' || null) {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Please enter a valid address' });
    } else {
      this.showProcessDialog = true;

      this.isProcessing = true;
      this.transferProcessMessage = "Processing..."
      this.isTransferProcessed = false;
      this.isTransferError = false;

      let keypair = localStorage.getItem("wallet-keypair") || "";
      this.transferData.keypair = keypair;
      let transferEventMessages = this.polkadotService.transferEventMessages.asObservable();

      if (this.selectedSourceToken == 'UMI') {
        this.polkadotService.transfer(this.transferData);
        transferEventMessages = this.polkadotService.transferEventMessages.asObservable();
      }

      if (this.selectedSourceToken == 'PHPU') {
        this.phpuContractService.transfer(this.transferData);
        transferEventMessages = this.phpuContractService.transferEventMessages.asObservable();
      }

      this.subscription = transferEventMessages.subscribe(
        message => {
          if (message != null) {
            if (message.hasError == true) {
              this.isProcessing = false;
              this.transferProcessMessage = message.message;
              this.isTransferProcessed = false;
              this.isTransferError = true;

              this.subscription.unsubscribe();
            } else {
              if (message.isFinalized != true) {
                this.transferProcessMessage = message.message;
              } else {
                this.isProcessing = false;
                this.transferProcessMessage = "Transfer Complete!"
                this.isTransferProcessed = true;
                this.isTransferError = false;

                this.transferData.keypair = "";
                this.transferData.recipient = "";
                this.transferData.amount = 0;
                this.sourceQuantity = 0;
                this.destinationQuantity = 0;

                this.subscription.unsubscribe();
              }
            }
          } else {
            this.isProcessing = false;
            this.transferProcessMessage = "Somethings went wrong";
            this.isTransferProcessed = false;
            this.isTransferError = true;

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
    this.transferData.amount = this.sourceQuantity;
    this.computeDestinationQuantity();
  }

  destinationTickerOnChange(event: any): void {
    this.computeDestinationQuantity();
  }

  computeDestinationQuantity(): void {
    this.destinationQuantity = this.sourceQuantity;
  }

  ngOnInit(): void {
    this.getForex();
  }
}
