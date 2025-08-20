import { TestBed } from '@angular/core/testing';

import { ProductoApi } from './producto-api';

describe('ProductoApi', () => {
  let service: ProductoApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
