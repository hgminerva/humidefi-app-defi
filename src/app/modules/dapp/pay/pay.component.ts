import { Component, OnInit } from '@angular/core';
import { Hash } from '@polkadot/types/interfaces';
import { TransferModel } from 'src/app/models/polkadot.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss']
})
export class PayComponent implements OnInit {

  walletMetaName: string = "";
  walletKeyPair: string = "";

  transferData: TransferModel = new TransferModel();
  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];

  constructor(
    private polkadotService: PolkadotService
  ) { }

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";

  async getBalance(): Promise<void> {
    let balance: Promise<string> = this.polkadotService.getBalance(this.walletKeyPair);
    this.transferData.amount = parseFloat((await balance));

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

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";

    this.getBalance();
  }
}
