import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingDetailsComponent } from './booking-details.component';
import { BookingService } from '../../services/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('BookingDetailsComponent', () => {
  let component: BookingDetailsComponent;
  let fixture: ComponentFixture<BookingDetailsComponent>;
  let mockBookingService: jasmine.SpyObj<BookingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getBookingDetails', 'cancelBooking']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: jasmine.createSpy().and.returnValue('1') } }
    };

    await TestBed.configureTestingModule({
      imports: [BookingDetailsComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailsComponent);
    component = fixture.componentInstance;
    mockBookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    mockBookingService.getBookingDetails.and.returnValue(of({
      id: 1,
      event_id: 1,
      attendee_id: 1,
      tickets_booked: 2,
      total_price: 100,
      booking_time: new Date(),
      qr_code: 'test-qr',
      status: 'confirmed',
      event_name: 'Test Event',
      event_date: new Date(),
      event_venue: 'Test Venue'
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});