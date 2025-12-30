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
  event_date?: Date;
  venue?: string;
  attendee_name?: string;
  attendee_email?: string;
}

export interface BookTicketRequest {
  event_id: number;
  tickets_booked: number;
}

export interface BookingResponse {
  message: string;
  booking: {
    id: number;
    event_id: number;
    tickets_booked: number;
    total_price: number;
    qr_code: string;
    event_name: string;
    event_date: Date;
    venue: string;
  };
}