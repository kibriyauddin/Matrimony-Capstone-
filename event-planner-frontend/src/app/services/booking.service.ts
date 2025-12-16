import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Booking {
  id: number;
  event_id: number;
  attendee_id: number;
  tickets_booked: number;
  total_price: number;
  booking_time: string;
  qr_code?: string;
  status: string;
  event_name?: string;
  venue?: string;
  date_time?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  createBooking(event_id: number, tickets_booked: number): Observable<any> {
    return this.http.post(
      this.apiUrl,
      { event_id, tickets_booked },
      { headers: this.getHeaders() }
    );
  }

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getEventAttendees(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/event/${eventId}/attendees`, {
      headers: this.getHeaders(),
    });
  }
}
