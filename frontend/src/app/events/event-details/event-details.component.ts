import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Event } from '../../models/event.model';
import { BookingModalComponent } from '../../shared/booking-modal/booking-modal.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  bookingForm: FormGroup;
  isLoading = true;
  isBooking = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.bookingForm = this.fb.group({
      tickets_booked: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(parseInt(eventId));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvent(eventId: number): void {
    this.eventService.getEvent(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.event = event;
          this.isLoading = false;
          
          // Set max tickets based on availability
          if (event.available_tickets) {
            this.bookingForm.get('tickets_booked')?.setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(event.available_tickets)
            ]);
            this.bookingForm.get('tickets_booked')?.updateValueAndValidity();
          }
        },
        error: (error) => {
          console.error('Error loading event:', error);
          this.isLoading = false;
          this.snackBar.open('Event not found', 'Close', { duration: 3000 });
          this.router.navigate(['/events']);
        }
      });
  }

  bookTickets(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to book tickets', 'Close', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.bookingForm.valid && this.event) {
      this.isBooking = true;
      
      const bookingData = {
        event_id: this.event.id,
        tickets_booked: this.bookingForm.value.tickets_booked
      };

      this.bookingService.bookTickets(bookingData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Booking response:', response);
            this.isBooking = false;
            
            // Show success message and redirect to booking details
            this.snackBar.open('🎉 Tickets booked successfully!', 'View Ticket', {
              duration: 5000,
              panelClass: ['success-snackbar']
            }).onAction().subscribe(() => {
              this.router.navigate(['/booking', response.booking.id]);
            });
            
            // Also reload event to update available tickets
            this.loadEvent(this.event!.id);
          },
          error: (error) => {
            this.isBooking = false;
            this.snackBar.open(
              error.error?.error || 'Booking failed. Please try again.',
              'Close',
              {
                duration: 5000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isOrganizer(): boolean {
    return this.authService.canAccessOrganizer();
  }

  canBookTickets(): boolean {
    if (!this.event) return false;
    
    // Check if user is attendee
    if (!this.authService.hasRole('attendee')) return false;
    
    // Check if event is sold out
    if (this.isSoldOut()) return false;
    
    // Check if event is in the future
    const eventDate = new Date(this.event.date_time);
    const now = new Date();
    
    return eventDate > now;
  }

  isSoldOut(): boolean {
    if (!this.event) return false;
    return (this.event.available_tickets || 0) <= 0;
  }

  getCapacityStatus(): 'available' | 'almost-full' | 'sold-out' | 'hot' {
    if (!this.event) return 'available';
    
    const availableTickets = this.event.available_tickets || 0;
    const capacity = this.event.capacity || 0;
    const ticketsSold = this.event.tickets_sold || 0;
    
    // If no available tickets, it's sold out
    if (availableTickets <= 0) {
      return 'sold-out';
    }
    
    const percentageSold = (ticketsSold / capacity) * 100;
    
    // Almost full if 90% or more sold
    if (percentageSold >= 90) {
      return 'almost-full';
    }
    
    // Hot event if 70% or more sold
    if (percentageSold >= 70) {
      return 'hot';
    }
    
    return 'available';
  }

  formatEventDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatEventTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAvailabilityText(): string {
    if (!this.event) return '';
    
    const available = this.event.available_tickets || 0;
    
    if (available === 0) {
      return 'Sold Out';
    } else if (available <= 10) {
      return `Only ${available} tickets left`;
    } else {
      return `${available} tickets available`;
    }
  }

  getAvailabilityClass(): string {
    if (!this.event) return '';
    
    const available = this.event.available_tickets || 0;
    
    if (available === 0) {
      return 'sold-out';
    } else if (available <= 10) {
      return 'low-availability';
    } else {
      return 'available';
    }
  }
}
