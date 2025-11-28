import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanHistoryComponent } from './loan-history';

describe('LoanHistoryComponent', () => {
  let component: LoanHistoryComponent;
  let fixture: ComponentFixture<LoanHistoryComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
