import { Component, OnInit } from '@angular/core';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService
  ) { }

  walletKeyPair: string = "";

  tokens: string[] = [];
  selectedToken: string = "";

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);
    this.tokens = (await tokens);
    this.selectedToken = this.tokens[0];
  }

  ngOnInit(): void {
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
    this.getChainTokens();
  }

}
