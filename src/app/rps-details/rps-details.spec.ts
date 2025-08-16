import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RpsDetails } from './rps-details';

describe('RpsDetails', () => {
  let component: RpsDetails;
  let fixture: ComponentFixture<RpsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RpsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RpsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
