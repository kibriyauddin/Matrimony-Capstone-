import { Request, Response } from 'express';
import pool from '../config/database';
import { Event } from '../models/types';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, venue, date_time, category, capacity, ticket_price, image_url } = req.body;

    // Validation
    if (!name || !venue || !date_time) {
      return res.status(400).json({ error: 'Event name, venue, and date are required' });
    }

    if (capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be greater than zero' });
    }

    const organizer_id = req.user!.id;

    // Insert event
    const [result] = await pool.query(
      `INSERT INTO events (organizer_id, name, description, venue, date_time, category, capacity, ticket_price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizer_id, name, description, venue, date_time, category, capacity, ticket_price || 0, image_url]
    );

    res.status(201).json({
      message: 'Event created successfully',
      eventId: (result as any).insertId
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { category, date, venue } = req.query;

    let query = 'SELECT * FROM events WHERE status = "active"';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (date) {
      query += ' AND DATE(date_time) = ?';
      params.push(date);
    }

    if (venue) {
      query += ' AND venue LIKE ?';
      params.push(`%${venue}%`);
    }

    query += ' ORDER BY date_time ASC';

    const [events] = await pool.query<Event[]>(query, params);

    // Get available seats for each event
    const eventsWithSeats = await Promise.all(
      events.map(async (event) => {
        const [bookings] = await pool.query<any[]>(
          'SELECT SUM(tickets_booked) as total_booked FROM bookings WHERE event_id = ? AND status = "confirmed"',
          [event.id]
        );
        const totalBooked = bookings[0].total_booked || 0;
        const availableSeats = event.capacity - totalBooked;

        return {
          ...event,
          availableSeats
        };
      })
    );

    res.json(eventsWithSeats);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Get available seats
    const [bookings] = await pool.query<any[]>(
      'SELECT SUM(tickets_booked) as total_booked FROM bookings WHERE event_id = ? AND status = "confirmed"',
      [id]
    );
    const totalBooked = bookings[0].total_booked || 0;
    const availableSeats = event.capacity - totalBooked;

    res.json({
      ...event,
      availableSeats
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, venue, date_time, category, capacity, ticket_price, image_url } = req.body;

    // Check if event exists and belongs to organizer
    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
      [id, req.user!.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or you are not authorized to update it' });
    }

    // Update event
    await pool.query(
      `UPDATE events 
       SET name = ?, description = ?, venue = ?, date_time = ?, category = ?, capacity = ?, ticket_price = ?, image_url = ?
       WHERE id = ?`,
      [name, description, venue, date_time, category, capacity, ticket_price, image_url, id]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to organizer
    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE id = ? AND organizer_id = ?',
      [id, req.user!.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or you are not authorized to cancel it' });
    }

    // Cancel event
    await pool.query(
      'UPDATE events SET status = "cancelled" WHERE id = ?',
      [id]
    );

    res.json({ message: 'Event cancelled successfully' });
  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response) => {
  try {
    const organizer_id = req.user!.id;

    const [events] = await pool.query<Event[]>(
      'SELECT * FROM events WHERE organizer_id = ? ORDER BY date_time DESC',
      [organizer_id]
    );

    // Get attendee count for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const [bookings] = await pool.query<any[]>(
          'SELECT SUM(tickets_booked) as total_booked, COUNT(*) as booking_count FROM bookings WHERE event_id = ? AND status = "confirmed"',
          [event.id]
        );
        const totalBooked = bookings[0].total_booked || 0;
        const bookingCount = bookings[0].booking_count || 0;

        return {
          ...event,
          totalTicketsSold: totalBooked,
          totalBookings: bookingCount,
          availableSeats: event.capacity - totalBooked
        };
      })
    );

    res.json(eventsWithStats);
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};