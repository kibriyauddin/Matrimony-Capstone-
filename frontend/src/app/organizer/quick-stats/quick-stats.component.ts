import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';

interface QuickStat {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: number;
  subtitle?: string;
}

@Component({
  selector: 'app-quick-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    RouterModule
  ],
  template: `
    <div class="quick-stats-container">
      <h2 class="stats-title">
        <mat-icon>dashboard</mat-icon>
        Quick Overview
      </h2>
      
      <div class="stats-grid" *ngIf="!isLoading">
        <mat-card *ngFor="let stat of stats" class="stat-card" [class]="'stat-' + stat.color">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-icon" [style.background]="getIconBackground(stat.color)">
                <mat-icon>{{ stat.icon }}</mat-icon>
              </div>
              <div class="stat-trend" *ngIf="stat.trend !== undefined">
                <mat-icon [class]="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
                  {{ stat.trend >= 0 ? 'trending_up' : 'trending_down' }}
                </mat-icon>
                <span>{{ Math.abs(stat.trend) }}%</span>
              </div>
            </div>
            
            <div class="stat-content">
              <h3 class="stat-value">
                <span *ngIf="stat.color === 'revenue'">₹</span>{{ stat.value | number }}
              </h3>
              <p class="stat-title">{{ stat.title }}</p>
              <p class="stat-subtitle" *ngIf="stat.subtitle">{{ stat.subtitle }}</p>
            </div>
            
            <div class="stat-progress" *ngIf="stat.color === 'revenue'">
              <mat-progress-bar mode="determinate" [value]="getRevenueProgress(stat.value)"></mat-progress-bar>
              <span class="progress-label">Monthly Goal: ₹50,000</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="loading-grid">
          <div *ngFor="let i of [1,2,3,4]" class="loading-card">
            <div class="loading-shimmer"></div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/organizer/create-event">
            <mat-icon>add</mat-icon>
            Create Event
          </button>
          <button mat-stroked-button routerLink="/organizer/email-test">
            <mat-icon>email</mat-icon>
            Test Email
          </button>
          <button mat-stroked-button routerLink="/events">
            <mat-icon>visibility</mat-icon>
            View All Events
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quick-stats-container {
      padding: 24px;
    }

    .stats-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3436;
      margin: 0 0 24px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-color);
    }

    .stat-events::before { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-bookings::before { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); }
    .stat-revenue::before { background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); }
    .stat-attendees::before { background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .trend-up {
      color: #00b894;
    }

    .trend-down {
      color: #e74c3c;
    }

    .stat-content {
      margin-bottom: 16px;
    }

    .stat-value {
      font-size: 2.2rem;
      font-weight: 700;
      color: #2d3436;
      margin: 0 0 8px 0;
    }

    .stat-title {
      font-size: 1rem;
      font-weight: 600;
      color: #636e72;
      margin: 0 0 4px 0;
    }

    .stat-subtitle {
      font-size: 0.85rem;
      color: #b2bec3;
      margin: 0;
    }

    .stat-progress {
      margin-top: 12px;
    }

    .progress-label {
      font-size: 0.8rem;
      color: #636e72;
      margin-top: 4px;
      display: block;
    }

    .quick-actions {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 16px;
    }

    .quick-actions h3 {
      margin: 0 0 16px 0;
      color: #2d3436;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      border-radius: 12px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .action-buttons button {
        width: 100%;
      }
    }

    /* Loading States */
    .loading-container {
      margin-bottom: 32px;
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .loading-card {
      height: 160px;
      border-radius: 16px;
      background: #f8f9fa;
      position: relative;
      overflow: hidden;
    }

    .loading-shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class QuickStatsComponent implements OnInit {
  stats: QuickStat[] = [];
  isLoading = true;

  constructor(
    private eventService: EventService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading = true;
    
    this.eventService.getOrganizerDashboardStats().subscribe({
      next: (dashboardStats) => {
        this.stats = [
          {
            title: 'Active Events',
            value: dashboardStats.activeEvents,
            icon: 'event',
            color: 'events',
            trend: 12,
            subtitle: 'Currently active'
          },
          {
            title: 'Total Bookings',
            value: dashboardStats.totalBookings,
            icon: 'confirmation_number',
            color: 'bookings',
            trend: 8,
            subtitle: 'All time bookings'
          },
          {
            title: 'Revenue',
            value: dashboardStats.totalRevenue,
            icon: 'currency_rupee',
            color: 'revenue',
            trend: -5,
            subtitle: 'Total earnings'
          },
          {
            title: 'Total Attendees',
            value: dashboardStats.totalAttendees,
            icon: 'people',
            color: 'attendees',
            trend: 15,
            subtitle: 'All time attendees'
          }
        ];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Fallback to default values on error
        this.stats = [
          {
            title: 'Active Events',
            value: 0,
            icon: 'event',
            color: 'events',
            subtitle: 'Currently active'
          },
          {
            title: 'Total Bookings',
            value: 0,
            icon: 'confirmation_number',
            color: 'bookings',
            subtitle: 'All time bookings'
          },
          {
            title: 'Revenue',
            value: 0,
            icon: 'currency_rupee',
            color: 'revenue',
            subtitle: 'Total earnings'
          },
          {
            title: 'Total Attendees',
            value: 0,
            icon: 'people',
            color: 'attendees',
            subtitle: 'All time attendees'
          }
        ];
        this.isLoading = false;
      }
    });
  }

  getIconBackground(color: string): string {
    const backgrounds = {
      events: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bookings: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
      revenue: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      attendees: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
    };
    return backgrounds[color as keyof typeof backgrounds] || backgrounds.events;
  }

  getRevenueProgress(currentRevenue: number): number {
    const monthlyGoal = 50000;
    return Math.min((currentRevenue / monthlyGoal) * 100, 100);
  }

  Math = Math;
}