import { TestBed } from '@angular/core/testing';

import { SolanaWalletService } from './solana-wallet.service';

describe('SolanaWalletService', () => {
  let service: SolanaWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolanaWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
