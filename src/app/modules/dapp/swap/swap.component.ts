import { Component, OnInit } from '@angular/core';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService
  ) { }

  walletKeyPair: string = "";

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
