import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchpadPageComponent } from './launchpad-page.component';

describe('LaunchpadPageComponent', () => {
  let component: LaunchpadPageComponent;
  let fixture: ComponentFixture<LaunchpadPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaunchpadPageComponent]
    });
    fixture = TestBed.createComponent(LaunchpadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
