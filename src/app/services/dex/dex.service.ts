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
import { SwapModel } from 'src/app/models/swap.model';
import { StakeModel } from 'src/app/models/stake.model';
import { RedeemModel } from 'src/app/models/redeem.model';

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

  redeemEventMessages = new Subject<any>();
  stakeEventMessages = new Subject<any>();
  swapEventMessages = new Subject<any>();

  async loadDexConfigs(): Promise<void> {
    const api = await this.api;
    const dexModule = api.query['dexModule'];

    if (dexModule != null) {
      const phpuDataStore = (await dexModule['phpuDataStore']()).toHuman();
      const phpuLiquidityAccountDataStore = (await dexModule['phpuLiquidityAccountDataStore']()).toHuman();
      const phpuLiquidityDataStore = (await dexModule['phpuLiquidityDataStore']()).toHuman();
      const umiLiquidityAccountDataStore = (await dexModule['umiLiquidityAccountDataStore']()).toHuman();
      const umiLiquidityDataStore = (await dexModule['umiLiquidityDataStore']()).toHuman();
      const swapFeesDataStore = (await dexModule['swapFeesDataStore']()).toHuman();
      const tickerDataStore = (await dexModule['tickerDataStore']()).toHuman();

      localStorage.setItem('phpu-contract-address', String(phpuDataStore));
      localStorage.setItem('lphpu-account-address', String(phpuLiquidityAccountDataStore));
      localStorage.setItem('lphpu-contract-address', String(phpuLiquidityDataStore));
      localStorage.setItem('lumi-account-address', String(umiLiquidityAccountDataStore));
      localStorage.setItem('lumi-contract-address', String(umiLiquidityDataStore));
      localStorage.setItem('swap-fees', String(swapFeesDataStore));
      localStorage.setItem('forex-updates', String(tickerDataStore));
    }
  }

  async doLiquidityRedeem(redeem: RedeemModel): Promise<void> {
    const api = await this.api;

    const injector = await web3FromAddress(this.keypair);
    api.setSigner(injector.signer);

    let message = "";

    await api.tx['dexModule']['doLiquidityRedeem'](redeem.source, redeem.quantity, redeem.sourceTicker).signAndSend(
      this.keypair, (result: any) => {
        message = 'Transaction status: ' + result.status.type;
        this.redeemEventMessages.next({ message: message, isFinalized: false, hasError: false });

        if (result.status.isInBlock) {
          message = 'Included at block hash\r\n' + result.status.asInBlock.toHex() + "\r\n\nFinalizing...";
          this.redeemEventMessages.next({ message: message, isFinalized: false, hasError: false });
        }

        if (result.status.isFinalized) {
          message = 'Finalized block hash ' + result.status.asFinalized.toHex();
          this.redeemEventMessages.next({ message: message, isFinalized: true, hasError: false });
        }
      }
    );
  }

  async doLiquidityStake(stake: StakeModel): Promise<void> {
    const api = await this.api;

    const injector = await web3FromAddress(this.keypair);
    api.setSigner(injector.signer);

    let message = "";

    await api.tx['dexModule']['doLiquidityStake'](stake.source, stake.quantity, stake.sourceTicker).signAndSend(
      this.keypair, (result: any) => {
        message = 'Transaction status: ' + result.status.type;
        this.stakeEventMessages.next({ message: message, isFinalized: false, hasError: false });

        if (result.status.isInBlock) {
          message = 'Included at block hash\r\n' + result.status.asInBlock.toHex() + "\r\n\nFinalizing...";
          this.stakeEventMessages.next({ message: message, isFinalized: false, hasError: false });
        }

        if (result.status.isFinalized) {
          message = 'Finalized block hash ' + result.status.asFinalized.toHex();
          this.stakeEventMessages.next({ message: message, isFinalized: true, hasError: false });
        }
      }
    );
  }

  async doSwap(swap: SwapModel): Promise<void> {
    const api = await this.api;

    const injector = await web3FromAddress(this.keypair);
    api.setSigner(injector.signer);

    let message = "";

    await api.tx['dexModule']['doSwap'](swap.source, swap.quantity, swap.sourceTicker, swap.destinationTicker).signAndSend(
      this.keypair, (result: any) => {
        message = 'Transaction status: ' + result.status.type;
        this.swapEventMessages.next({ message: message, isFinalized: false, hasError: false });

        if (result.status.isInBlock) {
          message = 'Included at block hash\r\n' + result.status.asInBlock.toHex() + "\r\n\nFinalizing...";
          this.swapEventMessages.next({ message: message, isFinalized: false, hasError: false });
        }

        if (result.status.isFinalized) {
          message = 'Finalized block hash ' + result.status.asFinalized.toHex();
          this.swapEventMessages.next({ message: message, isFinalized: true, hasError: false });
        }
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
