import { Injectable } from '@angular/core';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { stringToHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { WalletAccountsModel } from 'src/app/models/wallet-accounts.model';

@Injectable({
  providedIn: 'root'
})
export class WalletAccountsService {

  constructor() { }

  async getWeb3Accounts(): Promise<WalletAccountsModel[]> {
    let walletAccounts: WalletAccountsModel[] = [];
    let extensions = await web3Enable('humidefi');

    if (extensions.length > 0) {
      let accounts = await web3Accounts();
      if (accounts.length > 0) {
        console.log(accounts);
        for (let i = 0; i < accounts.length; i++) {
          walletAccounts.push({
            address: accounts[i].address,
            metaGenesisHash: accounts[i].meta.genesisHash,
            metaName: accounts[i].meta.name,
            metaSource: accounts[i].meta.source,
            type: accounts[i].type
          });
        }
      }
    }

    return walletAccounts;
  }

  async signAndVerify(walletAccount: WalletAccountsModel): Promise<boolean> {
    let injector = await web3FromSource(String(walletAccount.metaSource));
    let signRaw = injector?.signer?.signRaw;

    if (!!signRaw) {
      await cryptoWaitReady();

      let message: string = 'Please sign before you proceed. Thank you!';
      let { signature } = await signRaw({
        address: walletAccount.address,
        data: stringToHex(message),
        type: 'bytes'
      });

      let publicKey = decodeAddress(walletAccount.address);
      let hexPublicKey = u8aToHex(publicKey);

      let { isValid } = signatureVerify(message, signature, hexPublicKey);

      return isValid;
    }

    return false;
  }

  async generateKeypair(address: string): Promise<string> {
    let keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    let hexPair = keyring.addFromAddress(address);

    return hexPair.address;
  }
}
