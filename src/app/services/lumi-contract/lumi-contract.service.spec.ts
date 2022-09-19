import { TestBed } from '@angular/core/testing';

import { LumiContractService } from './lumi-contract.service';

describe('LumiContractService', () => {
  let service: LumiContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LumiContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
