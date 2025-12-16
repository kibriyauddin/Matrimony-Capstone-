import { Attendee } from './attendee.model';

export interface EventAttendeesResponse {
  event: {
    id: number;
    name: string;
    capacity: number;
  };
  totalBooked: number;
  remainingSeats: number;
  attendees: Attendee[];
}
