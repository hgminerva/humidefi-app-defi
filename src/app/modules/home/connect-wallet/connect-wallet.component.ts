import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletAccountsModel } from 'src/app/models/wallet-accounts.model';
import { WalletAccountsService } from 'src/app/services/wallet-accounts/wallet-accounts.service';

@Component({
  selector: 'app-connect-wallet',
  templateUrl: './connect-wallet.component.html',
  styleUrls: ['./connect-wallet.component.scss']
})
export class ConnectWalletComponent implements OnInit {

  constructor(
    private walletAccountsService: WalletAccountsService,
    private router: Router
  ) { }

  seletedWallet = "";
  web3Wallets: WalletAccountsModel[] = [];
  selectedWallet: WalletAccountsModel = new WalletAccountsModel();

  selectPolkadot(): void {
    this.seletedWallet = "PolkadotJS";

    this.web3Wallets = [];
    this.selectedWallet = new WalletAccountsModel();

    this.getWeb3Accounts();
  }

  async getWeb3Accounts(): Promise<void> {
    let web3Accounts: Promise<WalletAccountsModel[]> = this.walletAccountsService.getWeb3Accounts();
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
  }

  onWalletSelect(event: any): void {
    this.signAndVerify();
  }

  async signAndVerify(): Promise<void> {
    let signAndVerify: Promise<boolean> = this.walletAccountsService.signAndVerify(this.selectedWallet);
    let verified = (await signAndVerify);
    if (verified == true) {
      this.generateKeypair();
    }
  }

  async generateKeypair(): Promise<void> {
    let generateKeypair: Promise<string> = this.walletAccountsService.generateKeypair(this.selectedWallet.address);
    let keypair = (await generateKeypair);
    if (keypair != "") {
      localStorage.setItem("keypair", keypair);
      this.router.navigate(['/dapp']);
    }
  }

  ngOnInit(): void {
  }

}
