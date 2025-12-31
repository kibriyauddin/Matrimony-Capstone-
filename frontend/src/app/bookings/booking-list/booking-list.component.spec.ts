import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingListComponent } from './booking-list.component';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('BookingListComponent', () => {
  let component: BookingListComponent;
  let fixture: ComponentFixture<BookingListComponent>;
  let mockBookingService: jasmine.SpyObj<BookingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getMyBookings', 'cancelBooking']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [BookingListComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingListComponent);
    component = fixture.componentInstance;
    mockBookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    mockBookingService.getMyBookings.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    component.ngOnInit();
    expect(mockBookingService.getMyBookings).toHaveBeenCalled();
  });
});