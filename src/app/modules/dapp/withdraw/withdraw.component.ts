import { Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  constructor(
    private polkadotService: PolkadotService,
    private appSettings: AppSettings
  ) { }

  walletKeyPair: string = "";

  tokens: string[] = [];
  selectedToken: string = "";

  quantity: number = 0;
  phpValue: number = 0;

  async getChainTokens(): Promise<void> {
    let tokens: Promise<string[]> = this.polkadotService.getChainTokens(this.walletKeyPair);
    this.tokens = (await tokens);
    this.selectedToken = this.tokens[0];

    this.getPhpValue();
  }

  tickerOnChange(event: any): void {
    this.getPhpValue();
  }

  quantityOnKeyup(event: any): void {
    this.getPhpValue();
  }

  getPhpValue(): void {
    let phpCurrency = this.appSettings.currencies.filter(d => d.currency == "PHP")[0];
    if (phpCurrency != null) {
      let selectedToken = phpCurrency.tokensPrices.filter(d => d.token == this.selectedToken)[0];
      if (selectedToken != null) {
        this.phpValue = this.quantity * selectedToken.price;
      }
    }
  }

  ngOnInit(): void {
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
    this.getChainTokens();
  }
}
