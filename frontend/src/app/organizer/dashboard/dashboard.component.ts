import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  isLoading = true;
  
  // Statistics
  totalEvents = 0;
  totalTicketsSold = 0;
  totalRevenue = 0;
  upcomingEvents = 0;
  
  // Table configuration
  displayedColumns: string[] = ['name', 'date', 'sold', 'revenue', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrganizerEvents();
    this.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganizerEvents(): void {
    this.eventService.getOrganizerEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.calculateUpcomingEvents();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading organizer events:', error);
          this.isLoading = false;
        }
      });
  }

  private loadDashboardStats(): void {
    this.eventService.getOrganizerDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.totalEvents = stats.totalEvents;
          this.totalTicketsSold = stats.totalAttendees;
          this.totalRevenue = stats.totalRevenue;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          // Fallback to calculating from events if API fails
          this.calculateStatistics();
        }
      });
  }

  private calculateUpcomingEvents(): void {
    this.upcomingEvents = this.events.filter(event => 
      event.status === 'active' && new Date(event.date_time) > new Date()
    ).length;
  }

  private calculateStatistics(): void {
    this.totalEvents = this.events.length;
    this.totalTicketsSold = this.events.reduce((sum, event) => sum + (event.tickets_sold || 0), 0);
    this.totalRevenue = this.events.reduce((sum, event) => sum + ((event.tickets_sold || 0) * event.ticket_price), 0);
    this.calculateUpcomingEvents();
  }

  formatEventDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
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
    switch (status) {
      case 'active': return 'active';
      case 'cancelled': return 'cancelled';
      case 'completed': return 'completed';
      default: return '';
    }
  }

  getAvailabilityText(event: Event): string {
    const available = event.available_tickets || 0;
    
    if (available === 0) {
      return 'Sold Out';
    } else if (available <= 10) {
      return `${available} left`;
    } else {
      return `${available} available`;
    }
  }

  refreshDashboard(): void {
    this.loadOrganizerEvents();
  }

  navigateToManageEvents(): void {
    // Scroll to events section or show a modal with event list
    const eventsCard = document.querySelector('.events-card');
    if (eventsCard) {
      eventsCard.scrollIntoView({ behavior: 'smooth' });
    }
  }

  viewAttendees(eventId: number): void {
    this.router.navigate(['/organizer/event', eventId, 'attendees']);
  }

  viewAnalytics(): void {
    // Future implementation: Navigate to analytics view
    console.log('View analytics functionality - to be implemented');
  }

  // New methods for table functionality
  getProgressPercentage(event: Event): number {
    const sold = event.tickets_sold || 0;
    const capacity = event.capacity || 1;
    return (sold / capacity) * 100;
  }

  getEventRevenue(event: Event): number {
    const sold = event.tickets_sold || 0;
    return sold * event.ticket_price;
  }

  deleteEvent(event: Event): void {
    // Future implementation: Delete event with confirmation
    console.log('Delete event:', event.name);
  }
}
