import { Component, OnInit } from '@angular/core';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService
  ) { }

  walletKeyPair: string = "";

  networkSource: string[] = ['Acala', 'Humidefi'];
  selectedNetworkSource: string = "Acala";

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);

    this.sourceTokens = (await tokens);
    this.selectedSourceToken = this.sourceTokens[0];

    this.destinationTokens = (await tokens);
    this.selectedDestinationToken = this.destinationTokens[0];
  }

  ngOnInit(): void {
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
    this.getChainTokens();
  }

}
