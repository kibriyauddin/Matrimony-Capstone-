import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventAttendeesComponent } from './event-attendees.component';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('EventAttendeesComponent', () => {
  let component: EventAttendeesComponent;
  let fixture: ComponentFixture<EventAttendeesComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockBookingService: jasmine.SpyObj<BookingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvent']);
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getEventAttendees', 'cancelBooking']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: jasmine.createSpy().and.returnValue('1') } }
    };

    await TestBed.configureTestingModule({
      imports: [EventAttendeesComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventAttendeesComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockBookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    mockEventService.getEvent.and.returnValue(of({
      id: 1,
      name: 'Test Event',
      description: 'Test Description',
      venue: 'Test Venue',
      date_time: new Date(),
      category: 'Music',
      capacity: 100,
      ticket_price: 50,
      status: 'active',
      organizer_id: 1,
      created_at: new Date(),
      available_tickets: 50,
      tickets_sold: 50
    }));
    mockBookingService.getEventAttendees.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});