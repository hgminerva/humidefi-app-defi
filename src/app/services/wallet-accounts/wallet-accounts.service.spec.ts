import { TestBed } from '@angular/core/testing';

import { WalletAccountsService } from './wallet-accounts.service';

describe('WalletAccountsService', () => {
  let service: WalletAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
