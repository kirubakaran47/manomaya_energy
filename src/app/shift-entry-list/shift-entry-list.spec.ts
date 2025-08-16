import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftEntryList } from './shift-entry-list';

describe('ShiftEntryList', () => {
  let component: ShiftEntryList;
  let fixture: ComponentFixture<ShiftEntryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftEntryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftEntryList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
