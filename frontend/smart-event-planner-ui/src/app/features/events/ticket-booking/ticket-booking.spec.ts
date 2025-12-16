import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketBooking } from './ticket-booking';

describe('TicketBooking', () => {
  let component: TicketBooking;
  let fixture: ComponentFixture<TicketBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
