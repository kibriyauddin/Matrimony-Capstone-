export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'attendee' | 'organizer';
  created_at: Date;
}

export interface Event {
  id: number;
  organizer_id: number;
  name: string;
  description?: string;
  venue: string;
  date_time: Date;
  category: 'Music' | 'Workshop' | 'Conference' | 'Sports' | 'Technology' | 'Business' | 'Arts & Culture' | 'Food & Drink' | 'Health & Wellness' | 'Education' | 'Entertainment' | 'Networking' | 'Charity' | 'Fashion' | 'Travel' | 'Other';
  capacity: number;
  ticket_price: number;
  image_url?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: Date;
  organizer_name?: string;
  available_tickets?: number;
}

export interface Booking {
  id: number;
  event_id: number;
  attendee_id: number;
  tickets_booked: number;
  total_price: number;
  booking_time: Date;
  qr_code: string;
  status: 'confirmed' | 'cancelled';
  event_name?: string;
  attendee_name?: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  venue: string;
  date_time: string;
  category: string;
  capacity: number;
  ticket_price: number;
  image_url?: string;
}

export interface BookTicketRequest {
  event_id: number;
  tickets_booked: number;
}