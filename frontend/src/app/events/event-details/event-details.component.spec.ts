import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailsComponent } from './event-details.component';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvent']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: jasmine.createSpy().and.returnValue('1') } }
    };

    await TestBed.configureTestingModule({
      imports: [EventDetailsComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

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
    mockAuthService.getCurrentUser.and.returnValue(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});