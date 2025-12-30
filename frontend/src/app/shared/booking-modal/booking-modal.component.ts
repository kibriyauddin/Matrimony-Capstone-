import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';

export interface BookingModalData {
  booking: {
    id: number;
    event_name: string;
    event_date: string;
    venue: string;
    tickets_booked: number;
    total_price: number;
    qr_code: string;
  };
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="booking-success-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="success-icon">✅</div>
        <h2>Booking Confirmed!</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-body">
        <div class="booking-card">
          <div class="event-info">
            <h3>{{ data.booking.event_name }}</h3>
            <p class="booking-id">Booking ID: #{{ data.booking.id }}</p>
          </div>

          <div class="ticket-details">
            <div class="detail-item">
              <span class="label">📅 Date:</span>
              <span class="value">{{ formatDate(data.booking.event_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">📍 Venue:</span>
              <span class="value">{{ data.booking.venue }}</span>
            </div>
            <div class="detail-item">
              <span class="label">🎫 Tickets:</span>
              <span class="value">{{ data.booking.tickets_booked }}</span>
            </div>
            <div class="detail-item">
              <span class="label">💰 Total:</span>
              <span class="value">₹{{ data.booking.total_price }}</span>
            </div>
          </div>

          <div class="qr-section">
            <h4>Your Entry QR Code</h4>
            <div class="qr-container">
              <img [src]="qrCodeDataUrl" alt="QR Code" *ngIf="qrCodeDataUrl" class="qr-image">
              <div *ngIf="!qrCodeDataUrl" class="qr-loading">Generating QR Code...</div>
            </div>
            <p class="qr-note">Show this QR code at the event entrance</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-footer">
        <button mat-raised-button color="primary" (click)="downloadTicket()">
          📥 Download Ticket
        </button>
        <button mat-raised-button (click)="viewBookings()">
          📋 My Bookings
        </button>
        <button mat-button (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .booking-success-modal {
      width: 100%;
      max-width: 500px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .modal-header {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 20px;
      text-align: center;
      position: relative;
    }

    .success-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      color: white;
    }

    .modal-body {
      padding: 24px;
    }

    .booking-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e9ecef;
    }

    .event-info {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e9ecef;
    }

    .event-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .booking-id {
      margin: 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .ticket-details {
      margin-bottom: 24px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-item:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 16px;
    }

    .label {
      font-weight: 500;
      color: #555;
    }

    .value {
      font-weight: 600;
      color: #333;
    }

    .qr-section {
      text-align: center;
      margin-top: 20px;
    }

    .qr-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .qr-container {
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #ddd;
      display: inline-block;
      margin-bottom: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .qr-image {
      width: 150px;
      height: 150px;
      display: block;
    }

    .qr-loading {
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-style: italic;
    }

    .qr-note {
      margin: 0;
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .modal-footer {
      padding: 20px 24px;
      background: #f8f9fa;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .modal-footer button {
      min-width: 120px;
    }

    @media (max-width: 480px) {
      .booking-success-modal {
        margin: 10px;
        max-width: calc(100vw - 20px);
      }
      
      .modal-footer {
        flex-direction: column;
      }
      
      .modal-footer button {
        width: 100%;
      }
    }
  `]
})
export class BookingModalComponent implements OnInit {
  qrCodeDataUrl: string = '';

  constructor(
    public dialogRef: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingModalData,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Booking modal data:', this.data);
    this.generateQRCode();
  }

  private async generateQRCode(): Promise<void> {
    try {
      console.log('Generating QR code for:', this.data.booking.qr_code);
      this.qrCodeDataUrl = await QRCode.toDataURL(this.data.booking.qr_code, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.qrCodeDataUrl = '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadTicket(): void {
    const ticketData = `
🎫 EVENT TICKET 🎫
═══════════════════════════════════════

Event: ${this.data.booking.event_name}
Date: ${this.formatDate(this.data.booking.event_date)}
Venue: ${this.data.booking.venue}
Tickets: ${this.data.booking.tickets_booked}
Total Paid: ₹${this.data.booking.total_price}
Booking ID: #${this.data.booking.id}

═══════════════════════════════════════
QR Code Data: ${this.data.booking.qr_code}

Please show this ticket and QR code at the event entrance.
    `.trim();

    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${this.data.booking.event_name.replace(/[^a-zA-Z0-9]/g, '-')}-${this.data.booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  viewBookings(): void {
    this.dialogRef.close('view-bookings');
  }

  close(): void {
    this.dialogRef.close();
  }
}