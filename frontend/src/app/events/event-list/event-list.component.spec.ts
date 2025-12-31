import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEvents']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    mockEventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockEventService.getEvents.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load events on init', () => {
    component.ngOnInit();
    expect(mockEventService.getEvents).toHaveBeenCalled();
  });
});