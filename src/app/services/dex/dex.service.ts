import { Injectable } from '@angular/core';
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { stringToHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { WalletAccountsModel } from 'src/app/models/polkadot.model';
import { TransferModel } from 'src/app/models/transfer.model';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AppSettings } from 'src/app/app-settings';
import { Hash } from '@polkadot/types/interfaces';
import { BN, formatBalance } from '@polkadot/util';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DexService {

  constructor(
    private appSettings: AppSettings
  ) { }

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);
  api = ApiPromise.create({ provider: this.wsProvider });
  keypair = this.appSettings.keypair;
  extensions = web3Enable('humidefi');
  accounts = web3Accounts();

  async loadDexConfigs(): Promise<void> {
    const api = await this.api;

    const phpuDataStore = (await api.query['dexModule']['phpuDataStore']()).toHuman();
    const phpuLiquidityAccountDataStore = (await api.query['dexModule']['phpuLiquidityAccountDataStore']()).toHuman();
    const phpuLiquidityDataStore = (await api.query['dexModule']['phpuLiquidityDataStore']()).toHuman();
    const umiLiquidityAccountDataStore = (await api.query['dexModule']['umiLiquidityAccountDataStore']()).toHuman();
    const umiLiquidityDataStore = (await api.query['dexModule']['umiLiquidityDataStore']()).toHuman();
    const swapFeesDataStore = (await api.query['dexModule']['swapFeesDataStore']()).toHuman();
    const tickerDataStore = (await api.query['dexModule']['tickerDataStore']()).toHuman();

    localStorage.setItem('phpu-contract-address', String(phpuDataStore));
    localStorage.setItem('lphpu-account-address', String(phpuLiquidityAccountDataStore));
    localStorage.setItem('lphpu-contract-address', String(phpuLiquidityDataStore));
    localStorage.setItem('lumi-account-address', String(umiLiquidityAccountDataStore));
    localStorage.setItem('lumi-contract-address', String(umiLiquidityDataStore));
    localStorage.setItem('swap-fees', String(swapFeesDataStore));
    localStorage.setItem('forex-updates', String(tickerDataStore));
  }

  async doLiquidityRedeem(source: string, quantity: number, sourceTicker: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.doLiquidityRedeem(source, quantity, sourceTicker).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async doLiquidityStake(source: string, quantity: number, sourceTicker: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.doLiquidityStake(source, quantity, sourceTicker).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async doSwap(source: string, quantity: number, sourceTicker: string, destinationTicker: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.doSwap(source, quantity, sourceTicker, destinationTicker).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storeDexAccount(dexAccount: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storeDexAccount(dexAccount).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storePhpuContract(phpuContract: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storePhpuContract(phpuContract).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storePhpuLiquidityAccount(phpuLiquidityAccount: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storePhpuLiquidityAccount(phpuLiquidityAccount).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storePhpuLiquidityContract(phpuLiquidityContract: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storePhpuLiquidityContract(phpuLiquidityContract).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storeSwapFees(swapFees: number): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storeSwapFees(swapFees).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storeTickerPrice(tickerData: any): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storeTickerPrice(tickerData).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storeUmiLiquidityAccount(umiLiquidityAccount: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storeUmiLiquidityAccount(umiLiquidityAccount).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }

  async storeUmiLiquidityContract(umiLiquidityContract: string): Promise<void> {
    const api: any = await this.api;

    await api.query.dexModule.storeUmiLiquidityContract(umiLiquidityContract).signAndSend(
      this.keypair, (result: any) => {
        console.log(result);
      }
    );
  }
}
