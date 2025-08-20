import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OpenbookService } from './openbook.service';
import { PublicKey } from '@solana/web3.js';

export interface FeeTier {
  tier: number;
  maker: number;
  taker: number;
  platform: number;
}

@Injectable({ providedIn: 'root' })
export class FeeTierService {
  constructor(private openbook: OpenbookService) {}

  getFeeTier(odxMint: PublicKey): Observable<FeeTier> {
    return this.openbook.getOdxBalance(odxMint).pipe(
      map(balance => {
        let tier = 0, maker = 15, taker = 20;
        if (balance >= 1000) { tier = 2; maker = 10; taker = 10; }
        else if (balance >= 500) { tier = 1; maker = 12; taker = 17; }
        return { tier, maker, taker, platform: 20 };
      })
    );
  }
} 