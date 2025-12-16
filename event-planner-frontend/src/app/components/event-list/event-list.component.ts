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
import { EventService, Event } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-event-list',
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
  ],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories = [
    'Music',
    'Workshop',
    'Conference',
    'Sports',
    'Festival',
    'Other',
  ];
  selectedCategory = '';
  searchVenue = '';
  currentUser: any;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filteredEvents = events;
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  applyFilters() {
    this.filteredEvents = this.events.filter((event) => {
      const categoryMatch =
        !this.selectedCategory || event.category === this.selectedCategory;
      const venueMatch =
        !this.searchVenue ||
        event.venue.toLowerCase().includes(this.searchVenue.toLowerCase());
      return categoryMatch && venueMatch;
    });
  }

  viewEventDetails(eventId: number) {
    this.router.navigate(['/events', eventId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/organizer/dashboard']);
  }
}
