import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService,
    private appSettings: AppSettings,
    public decimalPipe: DecimalPipe
  ) { }

  walletKeyPair: string = "";

  gcashSourceTokens: string[] = [];
  gcashSelectedSourceToken: string = "";
  gcashTokenQuantity: number = 0;
  totalAmount: string = "0.00";

  networkSource: string[] = ['Acala', 'Humidefi'];
  selectedNetworkSource: string = "Acala";

  sourceTokens: string[] = [];
  selectedSourceToken: string = "";

  destinationTokens: string[] = [];
  selectedDestinationToken: string = "";

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);

    this.gcashSourceTokens = (await tokens);
    this.gcashSelectedSourceToken = this.sourceTokens[0];

    this.sourceTokens = (await tokens);
    this.selectedSourceToken = this.sourceTokens[0];

    this.destinationTokens = (await tokens);
    this.selectedDestinationToken = this.destinationTokens[0];
  }

  gcashSourceTickerOnChange(event: any): void {
    this.getPhpValue();
  }

  gcashSourceQuantityOnKeyup(event: any): void {
    this.getPhpValue();
  }

  getPhpValue(): void {
    let phpCurrency = this.appSettings.currencies.filter(d => d.currency == "PHP")[0];
    if (phpCurrency != null) {
      let selectedToken = phpCurrency.tokensPrices.filter(d => d.token == this.gcashSelectedSourceToken)[0];
      if (selectedToken != null) {
        let phpValue = this.gcashTokenQuantity * selectedToken.price;
        this.totalAmount = this.decimalPipe.transform(phpValue, "1.5-5") || "0";
      }
    }
  }

  ngOnInit(): void {
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
    this.getChainTokens();
  }
}
