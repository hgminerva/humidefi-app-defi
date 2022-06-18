import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.scss']
})
export class WalletInfoComponent implements OnInit {
  @Output() changeAccount = new EventEmitter();

  constructor(
    private router: Router,
    private clipboard: Clipboard
  ) { }

  walletMetaName: string = "";
  walletKeyPair: string = "";

  disconnect(): void {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  change(): void {
    this.changeAccount.emit();
  }

  copy() {
    this.clipboard.copy(this.walletKeyPair);
  }

  ngOnInit(): void {
    this.walletMetaName = localStorage.getItem("wallet-meta-name") || "";
    this.walletKeyPair = localStorage.getItem("wallet-keypair") || "";
  }

}
