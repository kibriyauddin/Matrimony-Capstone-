import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  isLoading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBookings(): void {
    this.bookingService.getMyBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          this.isLoading = false;
        }
      });
  }

  formatBookingDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  getStatusClass(status: string): string {
    return status === 'confirmed' ? 'confirmed' : 'cancelled';
  }

  parseNumber(value: any): number {
    return parseFloat(value) || 0;
  }

  canCancelBooking(booking: Booking): boolean {
    if (booking.status === 'cancelled' || !booking.event_date) {
      return false;
    }

    // Check if event is more than 24 hours away
    const eventDate = new Date(booking.event_date);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilEvent >= 24;
  }

  cancelBooking(booking: Booking): void {
    const eventDate = new Date(booking.event_date!);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let confirmMessage = `Are you sure you want to cancel your booking for "${booking.event_name}"?

Booking Details:
• ${booking.tickets_booked} ticket(s)
• Total amount: ₹${this.parseNumber(booking.total_price)}
• Event date: ${this.formatEventDate(booking.event_date!)} at ${this.formatEventTime(booking.event_date!)}

`;

    if (hoursUntilEvent >= 24) {
      confirmMessage += `✅ Full refund will be processed (cancelling ${Math.floor(hoursUntilEvent)} hours before event)`;
    } else if (hoursUntilEvent > 0) {
      confirmMessage += `⚠️ Partial or no refund available (only ${Math.floor(hoursUntilEvent)} hours before event)`;
    } else {
      confirmMessage += `⚠️ Event has already started or passed - no refund available`;
    }

    confirmMessage += `\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.bookingService.cancelBooking(booking.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.snackBar.open(
              `Booking cancelled successfully. ${response.refund_note || 'Refund will be processed if applicable.'}`,
              'Close',
              {
                duration: 5000,
                panelClass: ['success-snackbar']
              }
            );
            // Reload bookings to show updated status
            this.loadBookings();
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
