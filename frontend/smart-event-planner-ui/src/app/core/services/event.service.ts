import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Event } from '../../shared/models/event.model';
import { EventAttendeesResponse } from '../../shared/models/event-attendees.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly API = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ✅ Get all events
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API}/events`);
  }

  // ✅ Create event (SINGLE source of truth)
  createEvent(payload: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(`${this.API}/events`, payload);
  }
  

  // ✅ Get attendees for an event
  getEventAttendees(eventId: number): Observable<EventAttendeesResponse> {
    return this.http.get<EventAttendeesResponse>(
      `${this.API}/events/${eventId}/attendees`
    );
  }
}
