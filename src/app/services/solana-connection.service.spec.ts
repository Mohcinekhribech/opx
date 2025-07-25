import { TestBed } from '@angular/core/testing';

import { SolanaConnectionService } from './solana-connection.service';

describe('SolanaConnectionService', () => {
  let service: SolanaConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolanaConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
