import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  recentEvents: Event[] = [];
  totalEvents = 0;
  totalBookings = 89;
  totalOrganizers = 12;
  isLoading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = null;

    Promise.all([
      this.loadFeaturedEvents(),
      this.loadStats()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadFeaturedEvents(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventService.getEvents()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (events) => {
            this.recentEvents = events.slice(0, 3);
            this.totalEvents = events.length;
            resolve();
          },
          error: (error) => {
            console.error('Error loading events:', error);
            this.error = 'Failed to load events';
            this.showErrorMessage('Failed to load events');
            reject(error);
          }
        });
    });
  }

  private loadStats(): Promise<void> {
    return new Promise((resolve) => {
      // These could be loaded from actual API endpoints
      // For now using mock data with slight delay to simulate loading
      setTimeout(() => {
        this.totalBookings = 89;
        this.totalOrganizers = 12;
        resolve();
      }, 500);
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Retry', {
      duration: 5000,
      panelClass: ['error-snackbar']
    }).onAction().subscribe(() => {
      this.loadData();
    });
  }

  canAccessOrganizer(): boolean {
    return this.authService.canAccessOrganizer();
  }

  isAttendee(): boolean {
    return this.authService.hasRole('attendee');
  }

  formatEventDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  retryLoad(): void {
    this.loadData();
  }
}