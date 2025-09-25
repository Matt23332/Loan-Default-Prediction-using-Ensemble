import { TestBed } from '@angular/core/testing';

import { Environment } from './environment';

describe('Environment', () => {
  let service: Environment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Environment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
