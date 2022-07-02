import { Component, OnInit } from '@angular/core';
import { Hash } from '@polkadot/types/interfaces';
import { MessageService } from 'primeng/api';
import { AppSettings } from 'src/app/app-settings';
import { TransferModel } from 'src/app/models/polkadot.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss'],
  providers: [MessageService]
})
export class PayComponent implements OnInit {

  walletMetaName: string = "";
  walletKeyPair: string = "";

  transferData: TransferModel = new TransferModel();
  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];

  constructor(
    private polkadotService: PolkadotService,
    private appSettings: AppSettings,
    private messageService: MessageService
  ) { }

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";
  destinationQuantity: number = 0;

  async getBalance(): Promise<void> {
    let balance: Promise<string> = this.polkadotService.getBalance(this.walletKeyPair);
    // this.transferData.amount = parseFloat((await balance));

    await this.getChainTokens();
  }

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);

    this.sourceTokens = (await tokens);
    this.selectedSourceToken = this.sourceTokens[0];

    this.destinationTokens = (await tokens);
    this.selectedDestinationToken = this.destinationTokens[0];
  }

  async transfer(): Promise<void> {
    if (this.selectedSourceToken == '' || null) {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Please select token' });
    } else if (this.transferData.amount == 0 || null || '') {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Invalid amount' });
    } else if (this.transferData.recipient == '' || null) {
      this.messageService.add({ key: 'error-payment', severity: 'error', summary: 'Error', detail: 'Please enter a valid address' });
    } else {
      this.isProcessing = true;
      this.showProcessDialog = true;

      this.transferData.keypair = this.walletKeyPair;
      let isTransferProcessing: Promise<Hash> = this.polkadotService.transfer(this.transferData);

      if ((await isTransferProcessing).toString() != "") {
        this.isProcessing = false;
        this.showProcessDialog = false;

        this.transferData.keypair = "";
        this.transferData.recipient = "";
        this.transferData.amount = 0;

        this.getBalance();
      }
    }
  }

  sourceTickerOnChange(event: any): void {
    this.selectedDestinationToken = this.selectedSourceToken;
  }

  sourceQuantityOnBlur(event: any): void {
    this.transferData.amount = this.sourceQuantity;
    this.computeDestinationQuantity();
  }

  destinationTickerOnChange(event: any): void {
    this.computeDestinationQuantity();
  }

  computeDestinationQuantity(): void {
    let selectedSourceToken = this.appSettings.tokens.filter(d => d.token == this.selectedSourceToken)[0];
    if (selectedSourceToken != null) {
      let selectedDestinationToken = selectedSourceToken.tokensPrices.filter(d => d.token == this.selectedDestinationToken)[0];
      if (selectedDestinationToken != null) {
        this.destinationQuantity = this.sourceQuantity * selectedDestinationToken.price;
      }
    }
  }

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";

    this.getBalance();
  }
}
