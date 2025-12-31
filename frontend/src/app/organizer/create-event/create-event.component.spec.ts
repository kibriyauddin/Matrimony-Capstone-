import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateEventComponent } from './create-event.component';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('CreateEventComponent', () => {
  let component: CreateEventComponent;
  let fixture: ComponentFixture<CreateEventComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['createEvent']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [CreateEventComponent, BrowserAnimationsModule],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEventComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize event form', () => {
    expect(component.eventForm).toBeDefined();
    expect(component.eventForm.get('name')).toBeTruthy();
    expect(component.eventForm.get('description')).toBeTruthy();
    expect(component.eventForm.get('venue')).toBeTruthy();
  });
});