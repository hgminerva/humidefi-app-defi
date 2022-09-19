import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from 'src/app/app-settings';
import { WalletAccountsModel } from 'src/app/models/polkadot.model';
import { DexService } from 'src/app/services/dex/dex.service';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  @Input() isLogin: boolean = false;

  constructor(
    private polkadotService: PolkadotService,
    private router: Router,
    private dexService: DexService,
    private appSettings: AppSettings
  ) { }

  selectedWallet = "";
  chooseAccount: boolean = false;

  web3Wallets: WalletAccountsModel[] = [];
  selectedWalletAccount: WalletAccountsModel = new WalletAccountsModel();

  selectPolkadot(): void {
    this.selectedWallet = "PolkadotJS";

    this.web3Wallets = [];
    this.selectedWalletAccount = new WalletAccountsModel();

    this.getWeb3Accounts();
  }

  async getWeb3Accounts(): Promise<void> {
    let web3Accounts: Promise<WalletAccountsModel[]> = this.polkadotService.getWeb3Accounts();
    let data = (await web3Accounts);

    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        this.web3Wallets.push({
          address: data[i].address,
          metaGenesisHash: data[i].metaGenesisHash,
          metaName: data[i].metaName,
          metaSource: data[i].metaSource,
          type: data[i].type
        });
      }
    }

    this.chooseAccount = true;
  }

  onWalletSelect(event: any): void {
    this.signAndVerify();
  }

  async signAndVerify(): Promise<void> {
    let signAndVerify: Promise<boolean> = this.polkadotService.signAndVerify(this.selectedWalletAccount);
    let verified = (await signAndVerify);
    if (verified == true) {
      this.generateKeypair();
    }
  }

  async generateKeypair(): Promise<void> {
    let generateKeypair: Promise<string> = this.polkadotService.generateKeypair(this.selectedWalletAccount.address);
    let keypair = (await generateKeypair);
    if (keypair != "") {
      localStorage.setItem("wallet-meta-name", String(this.selectedWalletAccount.metaName));
      localStorage.setItem("wallet-keypair", keypair);

      if (this.isLogin == false) {
        await this.dexService.loadDexConfigs();
        this.appSettings.lumiAccountAddress = localStorage.getItem("lumi-account-address") || "";
        this.appSettings.lumiContractAddress = localStorage.getItem("lumi-contract-address") || "";
        this.appSettings.phpuContractAddress = localStorage.getItem("phpu-contract-address") || "";
        this.appSettings.lphpuAccountAddress = localStorage.getItem("lphpu-account-address") || "";
        this.appSettings.lphpuContractAddress = localStorage.getItem("lphpu-contract-address") || "";
        this.appSettings.swapFees = localStorage.getItem("swap-fees") || "";
        this.appSettings.forexUpdates = localStorage.getItem("forex-updates") || "";
        this.router.navigate(['/dapp']);
      } else {
        location.reload();
      }
    }
  }

  changeAccount(): void {
    this.selectPolkadot();
  }

  ngOnInit(): void {
    if (this.isLogin == true) {
      this.selectedWallet = "PolkadotJS";
    }
  }
}
