import { TestBed } from '@angular/core/testing';

import { LphpuContractService } from './lphpu-contract.service';

describe('LphpuContractService', () => {
  let service: LphpuContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LphpuContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
