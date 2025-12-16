import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService, Event } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './organizer-dashboard.component.html',
  styleUrl: './organizer-dashboard.component.css',
})
export class OrganizerDashboardComponent implements OnInit {
  events: Event[] = [];
  showCreateForm = false;
  editingEventId: number | null = null;
  currentUser: any;

  eventForm = {
    name: '',
    description: '',
    venue: '',
    date_time: '',
    category: 'Music',
    capacity: 100,
    ticket_price: 0,
    image_url: '',
  };

  categories = [
    'Music',
    'Workshop',
    'Conference',
    'Sports',
    'Festival',
    'Other',
  ];
  selectedEventAttendees: any[] = [];
  showAttendees = false;
  selectedEventName = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadEvents();
  }

  get totalRevenue(): number {
    return this.events.reduce(
      (sum, event) => sum + (event.totalTicketsSold || 0) * event.ticket_price,
      0
    );
  }

  get totalAttendees(): number {
    return this.events.reduce(
      (sum, event) => sum + (event.totalTicketsSold || 0),
      0
    );
  }

  get activeEventsCount(): number {
    return this.events.filter((e) => e.status === 'active').length;
  }

  getProgressPercentage(event: Event): number {
    const sold = event.totalTicketsSold || 0;
    return (sold / event.capacity) * 100;
  }

  loadEvents() {
    this.eventService.getOrganizerEvents().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.eventForm = {
      name: '',
      description: '',
      venue: '',
      date_time: '',
      category: 'Music',
      capacity: 100,
      ticket_price: 0,
      image_url: '',
    };
    this.editingEventId = null;
  }

  createEvent() {
    if (
      !this.eventForm.name ||
      !this.eventForm.venue ||
      !this.eventForm.date_time
    ) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.eventService.createEvent(this.eventForm).subscribe({
      next: () => {
        this.snackBar.open('Event created successfully!', 'Close', {
          duration: 3000,
        });
        this.loadEvents();
        this.toggleCreateForm();
      },
      error: (error) => {
        this.snackBar.open(
          error.error.error || 'Failed to create event',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  editEvent(event: Event) {
    this.editingEventId = event.id;
    this.showCreateForm = true;
    this.eventForm = {
      name: event.name,
      description: event.description,
      venue: event.venue,
      date_time: event.date_time,
      category: event.category,
      capacity: event.capacity,
      ticket_price: event.ticket_price,
      image_url: event.image_url || '',
    };
  }

  updateEvent() {
    if (!this.editingEventId) return;

    this.eventService
      .updateEvent(this.editingEventId, this.eventForm)
      .subscribe({
        next: () => {
          this.snackBar.open('Event updated successfully!', 'Close', {
            duration: 3000,
          });
          this.loadEvents();
          this.toggleCreateForm();
        },
        error: (error) => {
          this.snackBar.open(
            error.error.error || 'Failed to update event',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  cancelEvent(eventId: number) {
    if (confirm('Are you sure you want to cancel this event?')) {
      this.eventService.cancelEvent(eventId).subscribe({
        next: () => {
          this.snackBar.open('Event cancelled successfully!', 'Close', {
            duration: 3000,
          });
          this.loadEvents();
        },
        error: (error) => {
          this.snackBar.open(
            error.error.error || 'Failed to cancel event',
            'Close',
            { duration: 3000 }
          );
        },
      });
    }
  }

  viewAttendees(event: Event) {
    this.selectedEventName = event.name;
    this.bookingService.getEventAttendees(event.id).subscribe({
      next: (attendees) => {
        this.selectedEventAttendees = attendees;
        this.showAttendees = true;
      },
      error: (error) => {
        this.snackBar.open('Failed to load attendees', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  closeAttendees() {
    this.showAttendees = false;
    this.selectedEventAttendees = [];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToEvents() {
    this.router.navigate(['/events']);
  }
}
