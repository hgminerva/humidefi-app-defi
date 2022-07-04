import { TestBed } from '@angular/core/testing';

import { PhpuContractService } from './phpu-contract.service';

describe('PhpuContractService', () => {
  let service: PhpuContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhpuContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
