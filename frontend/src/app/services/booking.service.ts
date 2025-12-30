import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookTicketRequest, BookingResponse } from '../models/booking.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  bookTickets(request: BookTicketRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.API_URL}/bookings`, request);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings/my-bookings`);
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.API_URL}/bookings/${id}`);
  }

  getEventAttendees(eventId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.API_URL}/bookings/event/${eventId}/attendees`);
  }

  cancelBooking(id: number, reason?: string): Observable<any> {
    const body = reason ? { reason } : {};
    return this.http.delete(`${this.API_URL}/bookings/${id}`, { body });
  }
}