import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

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
}

class DatabaseService {
  public pool = pool;
  
  // User methods
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [userData.email, hashedPassword, userData.name, userData.role]
      );

      const newUser = await this.findUserById(result.insertId);
      if (!newUser) {
        throw new Error('Failed to create user');
      }
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, email, name, role, created_at FROM users'
      );
      return rows as Omit<User, 'password'>[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, updates: { name?: string; email?: string }): Promise<boolean> {
    try {
      const fields = [];
      const values = [];
      
      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      
      if (updates.email) {
        fields.push('email = ?');
        values.push(updates.email);
      }
      
      if (fields.length === 0) return false;
      
      values.push(userId);
      
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changeUserPassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Get current user
      const user = await this.findUserById(userId);
      if (!user) return false;

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) return false;

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error changing user password:', error);
      throw error;
    }
  }

  // Event methods
  async getAllEvents(): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          e.*,
          u.name as organizer_name,
          (e.capacity - COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0)) as available_tickets,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0) as tickets_sold
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN bookings b ON e.id = b.event_id
        WHERE e.status = 'active' AND e.date_time > NOW()
        GROUP BY e.id
        ORDER BY e.date_time ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  }

  async findEventById(id: number): Promise<any | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          e.*,
          u.name as organizer_name,
          (e.capacity - COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0)) as available_tickets,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0) as tickets_sold
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN bookings b ON e.id = b.event_id
        WHERE e.id = ?
        GROUP BY e.id
      `, [id]);
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding event by ID:', error);
      throw error;
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO events 
         (organizer_id, name, description, venue, date_time, category, capacity, ticket_price, image_url, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.organizer_id,
          eventData.name,
          eventData.description || null,
          eventData.venue,
          eventData.date_time,
          eventData.category,
          eventData.capacity,
          eventData.ticket_price,
          eventData.image_url || null,
          eventData.status
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<boolean> {
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'created_at') {
          fields.push(`${key} = ?`);
          // Convert undefined to null for MySQL compatibility
          values.push(value === undefined ? null : value);
        }
      }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async cancelEvent(id: number): Promise<boolean> {
    try {
      // Start a transaction to ensure both operations succeed or fail together
      await pool.execute('START TRANSACTION');
      
      // First, cancel all bookings for this event
      await pool.execute(
        'UPDATE bookings SET status = ? WHERE event_id = ? AND status = ?',
        ['cancelled', id, 'confirmed']
      );
      
      // Then, cancel the event itself
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE events SET status = ? WHERE id = ?',
        ['cancelled', id]
      );
      
      // Commit the transaction
      await pool.execute('COMMIT');
      
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback the transaction on error
      await pool.execute('ROLLBACK');
      console.error('Error cancelling event:', error);
      throw error;
    }
  }

  async getEventsByOrganizer(organizerId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          e.*,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0) as tickets_sold,
          (e.capacity - COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0)) as available_tickets
        FROM events e
        LEFT JOIN bookings b ON e.id = b.event_id
        WHERE e.organizer_id = ?
        GROUP BY e.id
        ORDER BY e.date_time DESC
      `, [organizerId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting events by organizer:', error);
      throw error;
    }
  }

  // Booking methods
  async createBooking(bookingData: Omit<Booking, 'id' | 'booking_time'>): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO bookings 
         (event_id, attendee_id, tickets_booked, total_price, qr_code, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bookingData.event_id,
          bookingData.attendee_id,
          bookingData.tickets_booked,
          bookingData.total_price,
          bookingData.qr_code,
          bookingData.status
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookingsByUser(userId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          b.*,
          e.name as event_name,
          e.venue,
          e.date_time as event_date
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        WHERE b.attendee_id = ?
        ORDER BY b.booking_time DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting bookings by user:', error);
      throw error;
    }
  }

  async findBookingById(id: number): Promise<any | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          b.*,
          e.name as event_name,
          e.venue,
          e.date_time as event_date,
          u.name as attendee_name
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN users u ON b.attendee_id = u.id
        WHERE b.id = ?
      `, [id]);
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding booking by ID:', error);
      throw error;
    }
  }

  async cancelBooking(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['cancelled', id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  async getEventAttendees(eventId: number): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          b.*,
          u.name as attendee_name,
          u.email as attendee_email
        FROM bookings b
        JOIN users u ON b.attendee_id = u.id
        WHERE b.event_id = ? AND b.status = 'confirmed'
        ORDER BY b.booking_time DESC
      `, [eventId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting event attendees:', error);
      throw error;
    }
  }

  // Dashboard statistics
  async getOrganizerStats(organizerId: number): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    totalBookings: number;
  }> {
    try {
      const [statsRows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          COUNT(DISTINCT e.id) as total_events,
          COUNT(DISTINCT CASE WHEN e.status = 'active' AND e.date_time > NOW() THEN e.id END) as active_events,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0) as total_attendees,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END), 0) as total_revenue,
          COUNT(CASE WHEN b.status = 'confirmed' THEN b.id END) as total_bookings
        FROM events e
        LEFT JOIN bookings b ON e.id = b.event_id
        WHERE e.organizer_id = ?
      `, [organizerId]);

      const stats = statsRows[0] as any;
      
      return {
        totalEvents: parseInt(stats.total_events) || 0,
        activeEvents: parseInt(stats.active_events) || 0,
        totalAttendees: parseInt(stats.total_attendees) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        totalBookings: parseInt(stats.total_bookings) || 0
      };
    } catch (error) {
      console.error('Error getting organizer stats:', error);
      throw error;
    }
  }

  // Database initialization
  async initializeDatabase(): Promise<void> {
    try {
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();