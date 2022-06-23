import { Component, OnInit } from '@angular/core';

interface SourceNetwork {
  name: string,
}

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  sourceNetworks: SourceNetwork[];

  walletMetaName: string = "";
  walletKeyPair: string = "";

  constructor() {
    this.sourceNetworks = [
      { name: 'UMI' }
    ];
  }

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
  }

}
