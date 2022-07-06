import { TestBed } from '@angular/core/testing';

import { ForexService } from './forex.service';

describe('ForexService', () => {
  let service: ForexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
