import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../shared/models/event.model';
import { TicketBookingComponent } from '../../events/ticket-booking/ticket-booking';

@Component({
  standalone: true,
  selector: 'app-organizer-dashboard',
  templateUrl: './organizer-dashboard.html',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    TicketBookingComponent
  ]
})
export class OrganizerDashboardComponent implements OnInit {

  events: Event[] = [];
  displayedColumns = ['name', 'venue', 'date', 'capacity', 'actions'];

  selectedEvent: Event | null = null;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: res => this.events = res,
      error: err => console.error(err)
    });
  }

  openBooking(event: Event): void {
    this.selectedEvent = event;
  }

  closeBooking(): void {
    this.selectedEvent = null;
  }
}
