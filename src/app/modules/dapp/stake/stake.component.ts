import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PolkadotService } from 'src/app/services/polkadot/polkadot.service';
import { Subscription } from 'rxjs';
import { PhpuContractService } from 'src/app/services/phpu-contract/phpu-contract.service';
import { ForexService } from 'src/app/services/forex/forex.service';
import { DecimalPipe } from '@angular/common';
import { ForexModel } from 'src/app/models/forex.model';
import { DexService } from 'src/app/services/dex/dex.service';
import { StakeModel } from 'src/app/models/stake.model';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  providers: [MessageService]
})
export class StakeComponent implements OnInit {

  stakeData: StakeModel = new StakeModel();

  isProcessing: boolean = false;
  showProcessDialog: boolean = false;

  tokens: string[] = [];
  isLoading: boolean = true;

  stakeProcessMessage: string = "";
  isStakeProcessed: boolean = false;
  isStakeError: boolean = false;
  subscription: Subscription = new Subscription;

  constructor(
    public decimalPipe: DecimalPipe,
    private polkadotService: PolkadotService,
    private phpuContractService: PhpuContractService,
    private forexService: ForexService,
    private messageService: MessageService,
    private dexService: DexService
  ) { }

  selectedSourceToken: string = "";
  sourceQuantity: number = 0;

  showStakeDialog: boolean = false;
  isStakeDialogLoading: boolean = false;

  async stake(): Promise<void> {
    if (this.sourceQuantity == 0) {
      this.messageService.add({ key: 'error-stake', severity: 'error', summary: 'Error', detail: 'Invalid quantity' });
    } else {
      this.showProcessDialog = true;

      this.isProcessing = true;
      this.stakeProcessMessage = "Processing..."
      this.isStakeProcessed = false;
      this.isStakeError = false;

      let keypair = localStorage.getItem("wallet-keypair") || "";
      let stake: StakeModel = {
        source: keypair,
        quantity: this.sourceQuantity,
        sourceTicker: this.selectedSourceToken
      };

      this.dexService.doLiquidityStake(stake);
      let stakeEventMessages = this.dexService.stakeEventMessages.asObservable();

      this.subscription = stakeEventMessages.subscribe(
        message => {
          if (message != null) {
            if (message.hasError == true) {
              this.isProcessing = false;
              this.stakeProcessMessage = message.message;
              this.isStakeProcessed = false;
              this.isStakeError = true;

              this.subscription.unsubscribe();
            } else {
              if (message.isFinalized != true) {
                this.stakeProcessMessage = message.message;
              } else {
                this.isProcessing = false;
                this.stakeProcessMessage = "Stake Complete!"
                this.isStakeProcessed = true;
                this.isStakeError = false;

                this.sourceQuantity = 0;
                this.showStakeDialog = false;

                this.subscription.unsubscribe();
              }
            }
          } else {
            this.isProcessing = false;
            this.stakeProcessMessage = "Somethings went wrong";
            this.isStakeProcessed = false;
            this.isStakeError = true;

            this.subscription.unsubscribe();
          }
        }
      );
    }
  }

  openStakeDialog(token: string): void {
    this.showStakeDialog = true;
    this.selectedSourceToken = token;
  }

  sourceQuantityOnBlur(event: any): void {
    this.stakeData.quantity = this.sourceQuantity;
  }

  ngOnInit(): void {
  }

}
