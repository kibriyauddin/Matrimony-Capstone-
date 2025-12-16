import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAttendees } from './event-attendees';

describe('EventAttendees', () => {
  let component: EventAttendees;
  let fixture: ComponentFixture<EventAttendees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAttendees]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAttendees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
