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
  image_url?: string | null;
  status: 'active' | 'cancelled' | 'completed';
  created_at: Date;
  organizer_name?: string;
  available_tickets?: number;
  tickets_sold?: number;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  venue: string;
  date_time: string;
  category: string;
  capacity: number;
  ticket_price: number;
  image_url?: string | null;
}

export interface EventFilters {
  category?: string;
  date?: string;
  venue?: string;
  search?: string;
}