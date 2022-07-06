import { Injectable } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { Subject } from 'rxjs';
import { TransferModel } from 'src/app/models/transfer.model';

@Injectable({
  providedIn: 'root'
})
export class PhpuContractService {

  constructor(
    private appSettings: AppSettings
  ) { }

  wsProvider = new WsProvider(this.appSettings.wsProviderEndpoint);
  api = ApiPromise.create({ provider: this.wsProvider });
  metadata: any = require("./../../../assets/contracts/metadata.json");
  contractAddress: string = "5GKDEef2erKw74MWzyniHeLWaQREjnDrpANA9f1ZkurAN5gf";

  transferEventMessages = new Subject<any>();

  async getProperties(): Promise<{ decimals: number, name: string | undefined, symbol: string | undefined, totalSupply: number }> {
    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const propDecimals = await contract.query["decimals"](this.contractAddress, options);
    const propName = await contract.query["name"](this.contractAddress, options);
    const propSymbol = await contract.query["symbol"](this.contractAddress, options);
    const propTotalSupply = await contract.query["totalSupply"](this.contractAddress, options);

    return {
      // decimals: parseFloat(String(propDecimals.output)),
      decimals: 14,
      name: propName.output?.toString(),
      symbol: propSymbol.output?.toString(),
      totalSupply: parseFloat(String(propTotalSupply.output))
    }
  }

  async approve(spenderAccountId: string, value: number): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
  }

  async mint(mintValue: number): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
  }

  async transfer(data: TransferModel): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract: any = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
    const decimals = (await this.getProperties()).decimals;

    const injector = await web3FromAddress(keypair);
    api.setSigner(injector.signer);

    let amount: bigint = BigInt(data.amount * (10 ** decimals));
    let message = "";

    await contract.tx.transfer(options, data.recipient, amount).signAndSend(
      data.keypair, (result: any) => {
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

  async transferFrom(fromAccountId: string, toAccountId: string, value: number): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract: any = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
  }

  async allowance(ownerAccountId: string, spenderAccountId: string, value: number): Promise<void> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract: any = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };
  }

  async balanceOf(ownerAccountId: string): Promise<string> {
    let keypair = localStorage.getItem("wallet-keypair") || "";

    const api = await this.api;
    const contract: any = new ContractPromise(api, this.metadata, this.contractAddress);
    const options = { storageDepositLimit: null, gasLimit: -1 };

    const decimals = (await this.getProperties()).decimals;
    const balanceOf = await contract.query.balanceOf(keypair, options, ownerAccountId);
    const balance = parseFloat(String(balanceOf.output).split(',').join(''));
    const amount: bigint = BigInt(balance / (10 ** decimals));

    return String(amount).split(',').join('');
  }
}
