import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseEntry } from './purchase-entry';

describe('PurchaseEntry', () => {
  let component: PurchaseEntry;
  let fixture: ComponentFixture<PurchaseEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
