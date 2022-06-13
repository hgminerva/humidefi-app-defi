import { Injectable } from '@angular/core';
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { stringToHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { TransferModel, WalletAccountsModel } from 'src/app/models/polkadot.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AppSettings } from 'src/app/app-settings';
import { Hash } from '@polkadot/types/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PolkadotService {

  constructor(
    private appSettings: AppSettings
  ) { }

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);

  async getWeb3Accounts(): Promise<WalletAccountsModel[]> {
    let walletAccounts: WalletAccountsModel[] = [];
    const extensions = await web3Enable('humidefi');

    if (extensions.length > 0) {
      const accounts = await web3Accounts();
      if (accounts.length > 0) {
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
    const injector = await web3FromSource(String(walletAccount.metaSource));
    const signRaw = injector?.signer?.signRaw;

    if (!!signRaw) {
      await cryptoWaitReady();

      const message: string = 'Please sign before you proceed. Thank you!';
      const { signature } = await signRaw({
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
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const hexPair = keyring.addFromAddress(address);

    return hexPair.address;
  }

  async getBalance(keypair: string): Promise<string> {
    const api = await ApiPromise.create({ provider: this.wsProvider });
    const { nonce, data: balance } = await api.query.system.account(keypair);

    return (parseFloat(balance.free.toString()) / 1000000000000).toString();
  }

  async transfer(data: TransferModel): Promise<Hash> {
    const api = await ApiPromise.create({ provider: this.wsProvider });

    await web3Enable('humidefi');
    await web3Accounts();
    const injector = await web3FromAddress(data.keypair);
    api.setSigner(injector.signer);

    let amount: number = data.amount * 1000000000000;

    return await api.tx.balances.transfer(data.recipient, amount).signAndSend(data.keypair);
  }
}
