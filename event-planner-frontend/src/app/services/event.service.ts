import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Event {
  id: number;
  organizer_id: number;
  name: string;
  description: string;
  venue: string;
  date_time: string;
  category: string;
  capacity: number;
  ticket_price: number;
  image_url?: string;
  status: string;
  availableSeats?: number;
  totalTicketsSold?: number;
  totalBookings?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:3000/api/events';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAllEvents(filters?: {
    category?: string;
    date?: string;
    venue?: string;
  }): Observable<Event[]> {
    let params: any = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.date) params.date = filters.date;
    if (filters?.venue) params.venue = filters.venue;

    return this.http.get<Event[]>(this.apiUrl, { params });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<any> {
    return this.http.post(this.apiUrl, event, { headers: this.getHeaders() });
  }

  updateEvent(id: number, event: Partial<Event>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, event, {
      headers: this.getHeaders(),
    });
  }

  cancelEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getOrganizerEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/organizer/my-events`, {
      headers: this.getHeaders(),
    });
  }
}
