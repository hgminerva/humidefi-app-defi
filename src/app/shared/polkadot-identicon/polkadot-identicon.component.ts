import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-polkadot-identicon',
  templateUrl: './polkadot-identicon.component.html',
  styleUrls: ['./polkadot-identicon.component.scss']
})
export class PolkadotIdenticonComponent implements OnInit {

  constructor() { }

  walletKeyPair: string = "";

  ngOnInit(): void {
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
  }

}
