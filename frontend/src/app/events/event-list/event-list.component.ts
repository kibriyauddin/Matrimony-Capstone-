import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, startWith, catchError, of } from 'rxjs';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = true;
  filterForm: FormGroup;
  categories: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      venue: [''],
      date: ['']
    });
    
    this.categories = this.eventService.getCategories();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): void {
    this.isLoading = true;
    
    this.eventService.getEvents()
      .pipe(
        startWith([]),
        catchError(error => {
          console.error('Error loading events:', error);
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (events) => {
          this.events = events;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.isLoading = false;
        }
      });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !filters.search || 
        event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.venue.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || event.category === filters.category;
      
      const matchesVenue = !filters.venue || 
        event.venue.toLowerCase().includes(filters.venue.toLowerCase());
      
      const matchesDate = !filters.date || 
        new Date(event.date_time).toDateString() === new Date(filters.date).toDateString();
      
      return matchesSearch && matchesCategory && matchesVenue && matchesDate;
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  performSearch(): void {
    // Search functionality is already handled by form value changes
    // This method can be used for additional search logic if needed
    this.applyFilters();
  }

  viewEventDetails(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  canCreateEvent(): boolean {
    return this.authService.canAccessOrganizer();
  }

  getCapacityStatus(event: Event): 'available' | 'almost-full' | 'sold-out' | 'hot' {
    const availableTickets = event.available_tickets || 0;
    const capacity = event.capacity || 0;
    const ticketsSold = event.tickets_sold || 0;
    
    // Debug logging
    console.log(`Event: ${event.name}, Available: ${availableTickets}, Capacity: ${capacity}, Sold: ${ticketsSold}`);
    
    // PRIORITY: If no available tickets, it's sold out (regardless of percentage)
    if (availableTickets <= 0) {
      console.log(`Event ${event.name} is SOLD OUT`);
      return 'sold-out';
    }
    
    const percentageSold = (ticketsSold / capacity) * 100;
    
    // Almost full if 90% or more sold (but still has tickets available)
    if (percentageSold >= 90) {
      console.log(`Event ${event.name} is ALMOST FULL (${percentageSold}%)`);
      return 'almost-full';
    }
    
    // Hot event if 70% or more sold
    if (percentageSold >= 70) {
      console.log(`Event ${event.name} is HOT (${percentageSold}%)`);
      return 'hot';
    }
    
    console.log(`Event ${event.name} is AVAILABLE (${percentageSold}%)`);
    return 'available';
  }

  createEvent(): void {
    this.router.navigate(['/organizer/create-event']);
  }

  getAvailabilityText(event: Event): string {
    const available = event.available_tickets || 0;
    
    if (available === 0) {
      return 'Sold Out';
    } else if (available <= 10) {
      return `Only ${available} left`;
    } else {
      return `${available} available`;
    }
  }

  getAvailabilityClass(event: Event): string {
    const available = event.available_tickets || 0;
    
    if (available === 0) {
      return 'sold-out';
    } else if (available <= 10) {
      return 'low';
    } else {
      return '';
    }
  }

  formatEventDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatEventTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Music': 'music_note',
      'Workshop': 'school',
      'Conference': 'business',
      'Sports': 'sports_soccer',
      'Other': 'category'
    };
    return icons[category] || 'category';
  }
}
