import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DexTradingPageComponent } from './dex-trading-page.component';

describe('DexTradingPageComponent', () => {
  let component: DexTradingPageComponent;
  let fixture: ComponentFixture<DexTradingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DexTradingPageComponent]
    });
    fixture = TestBed.createComponent(DexTradingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
