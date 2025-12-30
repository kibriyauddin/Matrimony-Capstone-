import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventRequest, EventFilters } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(filters?: EventFilters, page?: number, limit?: number): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.date) params = params.set('date', filters.date);
      if (filters.venue) params = params.set('venue', filters.venue);
      if (filters.search) params = params.set('search', filters.search);
    }

    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<any>(`${this.API_URL}/events`, { params });
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/events/${id}`);
  }

  createEvent(event: CreateEventRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/events`, event);
  }

  updateEvent(id: number, event: Partial<CreateEventRequest>): Observable<any> {
    return this.http.put(`${this.API_URL}/events/${id}`, event);
  }

  cancelEvent(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/events/${id}`);
  }

  getOrganizerEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/events/organizer/my-events`);
  }

  getOrganizerDashboardStats(): Observable<{
    totalEvents: number;
    activeEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    totalBookings: number;
  }> {
    return this.http.get<{
      totalEvents: number;
      activeEvents: number;
      totalAttendees: number;
      totalRevenue: number;
      totalBookings: number;
    }>(`${this.API_URL}/events/organizer/dashboard-stats`);
  }

  getCategories(): string[] {
    return ['Music', 'Workshop', 'Conference', 'Sports', 'Other'];
  }
}