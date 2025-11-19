import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanHistory } from './loan-history';

describe('LoanHistory', () => {
  let component: LoanHistory;
  let fixture: ComponentFixture<LoanHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
