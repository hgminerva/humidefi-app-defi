import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService,
    private appSettings: AppSettings
  ) { }

  walletKeyPair: string = "";

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";
  destinationQuantity: number = 0;

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);

    this.sourceTokens = (await tokens);
    this.selectedSourceToken = this.sourceTokens[0];

    this.destinationTokens = (await tokens);
    this.selectedDestinationToken = this.destinationTokens[0];
  }

  sourceTickerOnChange(event: any): void {
    this.selectedDestinationToken = this.selectedSourceToken;
  }

  sourceQuantityOnKeyup(event: any): void {
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
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
    this.getChainTokens();
  }
}
