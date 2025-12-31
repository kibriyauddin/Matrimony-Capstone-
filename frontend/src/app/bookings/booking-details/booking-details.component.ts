import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.css'
})
export class BookingDetailsComponent implements OnInit, OnDestroy {
  booking: Booking | null = null;
  isLoading = true;
  qrCodeDataUrl: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBooking(parseInt(bookingId));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBooking(bookingId: number): void {
    this.bookingService.getBooking(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          this.booking = booking;
          this.isLoading = false;
          this.generateQRCode();
        },
        error: (error) => {
          console.error('Error loading booking:', error);
          this.isLoading = false;
          this.router.navigate(['/bookings']);
        }
      });
  }

  private async generateQRCode(): Promise<void> {
    if (this.booking?.qr_code) {
      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(this.booking.qr_code, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }

  formatBookingDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getStatusClass(status: string): string {
    return status === 'confirmed' ? 'confirmed' : 'cancelled';
  }

  downloadTicket(): void {
    if (this.booking) {
      const ticketData = `
🎫 EVENT TICKET 🎫
═══════════════════════════════════════

Event: ${this.booking.event_name}
Date: ${this.booking.event_date ? this.formatEventDate(this.booking.event_date) : 'N/A'}
Time: ${this.booking.event_date ? this.formatEventTime(this.booking.event_date) : 'N/A'}
Venue: ${this.booking.venue}
Tickets: ${this.booking.tickets_booked}
Total Paid: ₹${this.booking.total_price}
Booking ID: #${this.booking.id}

═══════════════════════════════════════
QR Code Data: ${this.booking.qr_code}

Please show this ticket and QR code at the event entrance.
      `.trim();

      const blob = new Blob([ticketData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${this.booking.event_name?.replace(/[^a-zA-Z0-9]/g, '-')}-${this.booking.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }

  printTicket(): void {
    window.print();
  }

  cancelBooking(): void {
    if (!this.booking) return;

    const confirmMessage = `Are you sure you want to cancel this booking for "${this.booking.event_name}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.bookingService.cancelBooking(this.booking.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.snackBar.open(
              `Booking cancelled successfully. ${response.refund_note}`,
              'Close',
              {
                duration: 5000,
                panelClass: ['success-snackbar']
              }
            );
            // Reload booking to show updated status
            this.loadBooking(this.booking!.id);
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

  canCancelBooking(): boolean {
    if (!this.booking || this.booking.status === 'cancelled' || !this.booking.event_date) {
      return false;
    }

    // Check if event is more than 24 hours away
    const eventDate = new Date(this.booking.event_date);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilEvent >= 24;
  }

  parseNumber(value: any): number {
    return parseFloat(value) || 0;
  }
}
