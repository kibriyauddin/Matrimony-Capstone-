import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService, Event } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css',
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  eventId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEventDetails();
  }

  isOrganizer(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'organizer';
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

  bookTickets() {
    this.router.navigate(['/events', this.eventId, 'book']);
  }

  goBack() {
    this.router.navigate(['/events']);
  }
}
