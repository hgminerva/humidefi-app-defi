import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LphpuContractService {

  constructor(
    private appSettings: AppSettings
  ) { }

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);
  api = ApiPromise.create({ provider: this.wsProvider });
  keypair = this.appSettings.keypair;
  metadata: any = require("./../../../assets/contracts/lphpu_and_lumi_abi.json");
  contractAddress: string = this.appSettings.lphpuContractAddress;

  transferEventMessages = new Subject<any>();

  async burnFromMany(accounts: string[]): Promise<void> {

  }

  async mintTo(account: string, amount: number): Promise<void> {

  }

  async psp22Approve(spender: string, value: number): Promise<void> {

  }

  async psp22DecreaseAllowance(spender: string, deltaValue: number): Promise<void> {

  }

  async psp22IncreaseAllowance(spender: string, deltaValue: number): Promise<void> {

  }

  async psp22Transfer(to: string, value: number, data: string): Promise<void> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const decimals = await this.decimal();

    const injector = await web3FromAddress(this.keypair);
    api.setSigner(injector.signer);

    let amount: bigint = BigInt(value * (10 ** decimals));
    let message = "";

    await contract.tx['psp22::transfer'](options, to, amount, data).signAndSend(
      this.keypair, (result: any) => {
        message = 'Transaction status: ' + result.status.type;
        this.transferEventMessages.next({ message: message, isFinalized: false, hasError: false });

        if (result.status.isInBlock) {
          message = 'Included at block hash\r\n' + result.status.asInBlock.toHex() + "\r\n\nFinalizing...";
          this.transferEventMessages.next({ message: message, isFinalized: false, hasError: false });
        }

        if (result.status.isFinalized) {
          message = 'Finalized block hash ' + result.status.asFinalized.toHex();
          this.transferEventMessages.next({ message: message, isFinalized: true, hasError: false });
        }
      }
    );
  }

  async psp22TransferFrom(from: string, to: string, value: number, data: string): Promise<void> {

  }

  async psp22BurnableBurn(account: string, amount: number): Promise<void> {

  }

  async psp22MintableMint(account: string, amount: number): Promise<void> {

  }

  async decimal(): Promise<number> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const decimal = (await contract.query['decimal'](this.keypair, options)).output;

    if (decimal != null) {
      return parseFloat(String(decimal?.toHuman()));
    }

    return 14;
  }

  async name(): Promise<string> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const name = (await contract.query['name'](this.keypair, options)).output;

    if (name != null) {
      return String(name?.toHuman());
    }

    return "LPHPU";
  }

  async psp22Allowance(owner: string, spender: string): Promise<number> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const allowance = (await contract.query['psp22::allowance'](this.keypair, options, owner, spender)).output;

    if (allowance != null) {
      return parseFloat(String(allowance?.toHuman()).split(',').join(''));
    }

    return 0;
  }

  async psp22BalanceOf(owner: string): Promise<number> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const balanceOf = (await contract.query['psp22::balanceOf'](this.keypair, options, owner)).output;
    const decimals = await this.decimal();

    if (balanceOf != null) {
      return parseFloat(String(balanceOf?.toHuman()).split(',').join('')) / (10 ** decimals);
    }

    return 0;
  }

  async psp22TotalSupply(): Promise<number> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const totalSupply = (await contract.query['psp22::totalSupply'](this.keypair, options)).output;

    if (totalSupply != null) {
      return parseFloat(String(totalSupply?.toHuman()).split(',').join(''));
    }

    return 0;
  }

  async symbol(): Promise<string> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const symbol = (await contract.query['symbol'](this.keypair, options)).output;

    if (symbol != null) {
      return String(symbol?.toHuman());
    }

    return "LPHPU";
  }
}
