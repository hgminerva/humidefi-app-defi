import { Injectable } from '@angular/core';
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { stringToHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { TransferModel, WalletAccountsModel } from 'src/app/models/polkadot.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AppSettings } from 'src/app/app-settings';
import { Hash } from '@polkadot/types/interfaces';
import { BN, formatBalance } from '@polkadot/util';

@Injectable({
  providedIn: 'root'
})
export class PolkadotService {

  constructor(
    private appSettings: AppSettings
  ) { }

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);
  api = ApiPromise.create(
    {
      provider: this.wsProvider,
      types: {
        Balance: 'u128',
      },
    }
  );
  extensions = web3Enable('humidefi');
  accounts = web3Accounts();

  // Get all accounts from Polkadot Extensions
  async getWeb3Accounts(): Promise<WalletAccountsModel[]> {
    let walletAccounts: WalletAccountsModel[] = [];

    if ((await this.extensions).length > 0) {
      const accounts = await this.accounts;
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

  // Sign and verify transactions from Polkadot Extensions
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

  // Generate key pairs for public key from Polkadot Keyrings
  async generateKeypair(address: string): Promise<string> {
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    const hexPair = keyring.addFromAddress(address);

    return hexPair.address;
  }

  // Get Balances from Polkadot Query System Accounts
  async getBalance(keypair: string): Promise<string> {
    const api = await this.api;
    const { nonce, data: balance } = await api.query.system.account(keypair);
    const chainDecimals = api.registry.chainDecimals[0];
    formatBalance.setDefaults({ decimals: chainDecimals, unit: 'UMI' });
    formatBalance.getDefaults();

    const free = formatBalance(balance.free, { forceUnit: "UMI", withUnit: false }, chainDecimals);

    return free.split(',').join('');
  }

  // Transfer Balances from Polkadot Transactions
  async transfer(data: TransferModel): Promise<Hash> {
    const api = await this.api;
    const chainDecimals = api.registry.chainDecimals[0];
    const injector = await web3FromAddress(data.keypair);
    api.setSigner(injector.signer);

    let amount: bigint = BigInt(data.amount * (10 ** chainDecimals));

    return await api.tx.balances.transfer(data.recipient, amount).signAndSend(data.keypair);
  }

  // Retrieve chain tokens from Polkadot Registry (Chain Information)
  async getChainTokens(keypair: string): Promise<string[]> {
    const api = await this.api;
    const tokens = api.registry.chainTokens;

    return tokens;
  }
}
