import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycPageComponent } from './kyc-page.component';

describe('KycPageComponent', () => {
  let component: KycPageComponent;
  let fixture: ComponentFixture<KycPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KycPageComponent]
    });
    fixture = TestBed.createComponent(KycPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
