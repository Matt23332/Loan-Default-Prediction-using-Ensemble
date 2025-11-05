import { TestBed } from '@angular/core/testing';

import { LoanPrediction } from './loan-prediction';

describe('LoanPrediction', () => {
  let service: LoanPrediction;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanPrediction);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
