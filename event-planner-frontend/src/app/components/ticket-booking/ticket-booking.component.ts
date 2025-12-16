import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService, Event } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-ticket-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './ticket-booking.component.html',
  styleUrl: './ticket-booking.component.css',
})
export class TicketBookingComponent implements OnInit {
  event: Event | null = null;
  eventId: number = 0;
  ticketsBooked: number = 1;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEventDetails();
  }

  loadEventDetails() {
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
      },
      error: (error) => {
        console.error('Error loading event:', error);
      },
    });
  }

  get totalPrice(): number {
    return this.event ? this.event.ticket_price * this.ticketsBooked : 0;
  }

  confirmBooking() {
    if (!this.event) return;

    if (this.ticketsBooked <= 0) {
      this.snackBar.open('Please enter a valid number of tickets', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (this.ticketsBooked > (this.event.availableSeats || 0)) {
      this.snackBar.open('Not enough seats available', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    this.bookingService
      .createBooking(this.eventId, this.ticketsBooked)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Booking successful!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/booking', response.bookingId]);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error.error || 'Booking failed', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  goBack() {
    this.router.navigate(['/events', this.eventId]);
  }
}
