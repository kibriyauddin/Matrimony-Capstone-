import { Request, Response } from 'express';
import pool from '../config/database';
import { Booking, Event } from '../models/types';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { event_id, tickets_booked } = req.body;

    // Validation
    if (!event_id || !tickets_booked) {
      return res.status(400).json({ error: 'Event ID and number of tickets are required' });
    }

    if (tickets_booked <= 0) {
      return res.status(400).json({ error: 'Number of tickets must be greater than zero' });
    }

    // Check if event exists and is active
    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE id = ? AND status = "active"',
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or is no longer active' });
    }

    const event = events[0];

    // Check available seats
    const [bookings] = await pool.query<any[]>(
      'SELECT SUM(tickets_booked) as total_booked FROM bookings WHERE event_id = ? AND status = "confirmed"',
      [event_id]
    );

    const totalBooked = bookings[0].total_booked || 0;
    const availableSeats = event.capacity - totalBooked;

    if (tickets_booked > availableSeats) {
      return res.status(400).json({
        error: `Only ${availableSeats} seats available. Cannot book ${tickets_booked} tickets.`
      });
    }

    // Calculate total price
    const total_price = event.ticket_price * tickets_booked;

    // Generate simple QR code data (you can use a QR library for actual QR generation)
    const qr_code = `EVENT-${event_id}-USER-${req.user!.id}-${Date.now()}`;

    // Create booking
    const [result] = await pool.query(
      'INSERT INTO bookings (event_id, attendee_id, tickets_booked, total_price, qr_code) VALUES (?, ?, ?, ?, ?)',
      [event_id, req.user!.id, tickets_booked, total_price, qr_code]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: (result as any).insertId,
      qr_code
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const attendee_id = req.user!.id;

    const [bookings] = await pool.query<any[]>(
      `SELECT b.*, e.name as event_name, e.venue, e.date_time, e.category
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.attendee_id = ?
       ORDER BY b.booking_time DESC`,
      [attendee_id]
    );

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [bookings] = await pool.query<any[]>(
      `SELECT b.*, e.name as event_name, e.venue, e.date_time, e.category, e.ticket_price
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.id = ? AND b.attendee_id = ?`,
      [id, req.user!.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const [bookings] = await pool.query<Booking[]>(
      'SELECT * FROM bookings WHERE id = ? AND attendee_id = ?',
      [id, req.user!.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Cancel booking
    await pool.query(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventAttendees = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    // Verify that the event belongs to the organizer
    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, req.user!.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or you are not authorized' });
    }

    // Get all attendees for this event
    const [attendees] = await pool.query<any[]>(
      `SELECT b.id as booking_id, b.tickets_booked, b.total_price, b.booking_time, b.status,
              u.full_name, u.email
       FROM bookings b
       JOIN users u ON b.attendee_id = u.id
       WHERE b.event_id = ?
       ORDER BY b.booking_time DESC`,
      [eventId]
    );

    res.json(attendees);
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
