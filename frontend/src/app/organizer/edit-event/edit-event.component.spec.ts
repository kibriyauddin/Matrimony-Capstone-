import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditEventComponent } from './edit-event.component';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('EditEventComponent', () => {
  let component: EditEventComponent;
  let fixture: ComponentFixture<EditEventComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvent', 'updateEvent', 'cancelEvent']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: jasmine.createSpy().and.returnValue('1') } }
    };

    await TestBed.configureTestingModule({
      imports: [EditEventComponent, BrowserAnimationsModule],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditEventComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});