import { TestBed } from '@angular/core/testing';

import { DexService } from './dex.service';

describe('DexService', () => {
  let service: DexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
