import { Component, OnInit } from '@angular/core';
import { Hash } from '@polkadot/types/interfaces';
import { TransferModel } from 'src/app/models/polkadot.model';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

interface SourceNetwork {
  name: string,
}

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  sourceNetworks: SourceNetwork[];

  walletMetaName: string = "";
  walletKeyPair: string = "";
  walletBalance: string = "";

  transferData: TransferModel = new TransferModel();
  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  constructor(
    private polkadotService: PolkadotService
  ) {
    this.sourceNetworks = [
      { name: 'UMI' }
    ];
  }

  async getBalance(): Promise<void> {
    let balance: Promise<string> = this.polkadotService.getBalance(this.walletKeyPair);
    this.walletBalance = (await balance);
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
