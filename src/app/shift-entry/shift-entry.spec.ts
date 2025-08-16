import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftEntry } from './shift-entry';

describe('ShiftEntry', () => {
  let component: ShiftEntry;
  let fixture: ComponentFixture<ShiftEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
