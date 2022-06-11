import { Component, OnInit } from '@angular/core';

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

  constructor() {
    this.sourceNetworks = [
      { name: 'Acala' }
    ];
  }

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
  }

}
