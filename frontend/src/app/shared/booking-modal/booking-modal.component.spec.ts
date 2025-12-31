import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingModalComponent } from './booking-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingService } from '../../services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('BookingModalComponent', () => {
  let component: BookingModalComponent;
  let fixture: ComponentFixture<BookingModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BookingModalComponent>>;
  let mockBookingService: jasmine.SpyObj<BookingService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockDialogData = {
    event: {
      id: 1,
      name: 'Test Event',
      ticket_price: 50,
      available_tickets: 10
    }
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['bookTicket']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [BookingModalComponent, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingModalComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<BookingModalComponent>>;
    mockBookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with event data', () => {
    expect(component.event).toEqual(mockDialogData.event);
  });
});