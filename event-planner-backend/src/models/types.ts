import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  full_name: string;
  role: 'attendee' | 'organizer' | 'admin';
  created_at: Date;
}

export interface Event extends RowDataPacket {
  id: number;
  organizer_id: number;
  name: string;
  description: string;
  venue: string;
  date_time: Date;
  category: string;
  capacity: number;
  ticket_price: number;
  image_url?: string;
  status: 'active' | 'cancelled';
  created_at: Date;
}

export interface Booking extends RowDataPacket {
  id: number;
  event_id: number;
  attendee_id: number;
  tickets_booked: number;
  total_price: number;
  booking_time: Date;
  qr_code?: string;
  status: 'confirmed' | 'cancelled';
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}