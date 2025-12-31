import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-attendees',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './event-attendees.component.html',
  styleUrl: './event-attendees.component.css'
})
export class EventAttendeesComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  attendees: any[] = [];
  filteredAttendees: any[] = [];
  isLoading = true;
  searchTerm = '';
  
  displayedColumns = ['attendee_name', 'tickets_booked', 'total_price', 'booking_time', 'status', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventAndAttendees(parseInt(eventId));
    } else {
      this.isLoading = false;
      this.snackBar.open('No event ID provided', 'Close', { duration: 3000 });
      this.router.navigate(['/organizer/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEventAndAttendees(eventId: number): void {
    // Load event details
    this.eventService.getEvent(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.event = event;
        },
        error: (error) => {
          console.error('Error loading event:', error);
          this.snackBar.open('Event not found', 'Close', { duration: 3000 });
          this.router.navigate(['/organizer/dashboard']);
        }
      });

    // Load attendees
    this.bookingService.getEventAttendees(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (attendees) => {
          this.attendees = attendees;
          this.filteredAttendees = attendees;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading attendees:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to load attendees', 'Close', { duration: 3000 });
        }
      });
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterAttendees();
  }

  private filterAttendees(): void {
    if (!this.searchTerm) {
      this.filteredAttendees = this.attendees;
    } else {
      this.filteredAttendees = this.attendees.filter(attendee =>
        attendee.attendee_name.toLowerCase().includes(this.searchTerm) ||
        attendee.attendee_email.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  getTotalTicketsSold(): number {
    return this.attendees
      .filter(attendee => attendee.status === 'confirmed')
      .reduce((total, attendee) => total + parseInt(attendee.tickets_booked || 0), 0);
  }

  getTotalRevenue(): number {
    return this.attendees
      .filter(attendee => attendee.status === 'confirmed')
      .reduce((total, attendee) => total + parseFloat(attendee.total_price || 0), 0);
  }

  getConfirmedBookings(): number {
    return this.attendees.filter(attendee => attendee.status === 'confirmed').length;
  }

  getCancelledBookings(): number {
    return this.attendees.filter(attendee => attendee.status === 'cancelled').length;
  }

  exportAttendeesList(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.event?.name?.replace(/[^a-zA-Z0-9]/g, '-')}-attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Attendees list exported successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private generateCSV(): string {
    const headers = ['Name', 'Email', 'Tickets', 'Amount', 'Booking Date', 'Status'];
    const rows = this.attendees.map(attendee => [
      attendee.attendee_name,
      attendee.attendee_email,
      attendee.tickets_booked,
      attendee.total_price,
      new Date(attendee.booking_time).toLocaleDateString(),
      attendee.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return status === 'confirmed' ? 'confirmed' : 'cancelled';
  }

  viewAttendeeDetails(attendee: any): void {
    // Show detailed attendee information in a dialog or navigate to detail page
    this.snackBar.open(`Viewing details for ${attendee.attendee_name}`, 'Close', {
      duration: 2000
    });
  }

  sendEmailToAttendee(attendee: any): void {
    // Open email client with pre-filled email
    const subject = encodeURIComponent(`Regarding your booking for ${this.event?.name}`);
    const body = encodeURIComponent(`Dear ${attendee.attendee_name},\n\nThank you for booking tickets for ${this.event?.name}.\n\nBest regards,\nEvent Organizer`);
    const mailtoLink = `mailto:${attendee.attendee_email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  }

  getStatusIcon(status: string): string {
    return status === 'confirmed' ? 'check_circle' : 'cancel';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  }

  parseNumber(value: any): number {
    return parseFloat(value) || 0;
  }

  cancelAttendeeBooking(attendee: any): void {
    const reason = prompt(`Cancel booking for ${attendee.attendee_name}?\n\nPlease provide a reason:`);
    
    if (reason !== null && reason.trim()) {
      this.bookingService.cancelBooking(attendee.id, reason.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.snackBar.open(
              `Booking cancelled successfully for ${attendee.attendee_name}. ${response.refund_note || 'Refund will be processed.'}`,
              'Close',
              {
                duration: 5000,
                panelClass: ['success-snackbar']
              }
            );
            // Reload attendees to show updated status
            const eventId = this.route.snapshot.paramMap.get('id');
            if (eventId) {
              this.loadEventAndAttendees(parseInt(eventId));
            }
          },
          error: (error) => {
            this.snackBar.open(
              error.error?.error || 'Failed to cancel booking',
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
}