import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getOrganizerEvents', 'getOrganizerDashboardStats', 'cancelEvent']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default return values
    mockEventService.getOrganizerEvents.and.returnValue(of([]));
    mockEventService.getOrganizerDashboardStats.and.returnValue(of({
      totalEvents: 0,
      totalAttendees: 0,
      totalRevenue: 0,
      totalBookings: 0,
      activeEvents: 0
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organizer events on init', () => {
    component.ngOnInit();
    expect(mockEventService.getOrganizerEvents).toHaveBeenCalled();
  });

  it('should load dashboard stats on init', () => {
    component.ngOnInit();
    expect(mockEventService.getOrganizerDashboardStats).toHaveBeenCalled();
  });
});