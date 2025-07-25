import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestnetPageComponent } from './testnet-page.component';

describe('TestnetPageComponent', () => {
  let component: TestnetPageComponent;
  let fixture: ComponentFixture<TestnetPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestnetPageComponent]
    });
    fixture = TestBed.createComponent(TestnetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
