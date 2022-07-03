import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BlueprintPromise, CodePromise, ContractPromise, Abi } from '@polkadot/api-contract';
import { assert } from '@polkadot/util';
import { web3FromAddress } from '@polkadot/extension-dapp';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);
  api = ApiPromise.create({ provider: this.wsProvider });
  metadata: any = require("./../../../assets/contracts/metadata.json");
  contractAddress: string = "5GKDEef2erKw74MWzyniHeLWaQREjnDrpANA9f1ZkurAN5gf";

  constructor(
    private appSettings: AppSettings
  ) { }

  async initContract(): Promise<ContractPromise> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);

    return contract;
  }

  async getProperties(): Promise<{ decimals: number, name: string | undefined, symbol: string | undefined, totalSupply: number }> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const propDecimals = await contract.query["decimals"](this.contractAddress, options);
    const propName = await contract.query["name"](this.contractAddress, options);
    const propSymbol = await contract.query["symbol"](this.contractAddress, options);
    const propTotalSupply = await contract.query["totalSupply"](this.contractAddress, options);

    return {
      decimals: parseFloat(String(propDecimals.output)),
      name: propName.output?.toString(),
      symbol: propSymbol.output?.toString(),
      totalSupply: parseFloat(String(propTotalSupply.output))
    }
  }

  async approve(spenderAccountId: string, value: number): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const approve = await contract.query["approve"](this.contractAddress, options, spenderAccountId, value);

    return String(approve.output);
  }

  async mint(mintValue: number): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const mint = await contract.query["mint"](this.contractAddress, options, mintValue);

    return String(mint.output);
  }

  async transfer(toAccountId: string, value: number): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const transfer = await contract.query["transfer"](this.contractAddress, options, toAccountId, value);

    return String(transfer.output);
  }

  async transferFrom(fromAccountId: string, toAccountId: string, value: number): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const transferFrom = await contract.query["transferFrom"](this.contractAddress, options, fromAccountId, toAccountId, value);

    return String(transferFrom.output);
  }

  async allowance(ownerAccountId: string, spenderAccountId: string, value: number): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const allowance = await contract.query["allowance"](this.contractAddress, options, ownerAccountId, spenderAccountId, value);

    return String(allowance.output);
  }

  async balanceOf(ownerAccountId: string): Promise<string> {
    const contract = await this.initContract();
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const balanceOf = await contract.query["balanceOf"](this.contractAddress, options, ownerAccountId);

    return String(balanceOf.output);
  }
}
