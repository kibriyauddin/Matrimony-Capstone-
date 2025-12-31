import express, { Request, Response, NextFunction } from 'express';
import { db } from '../services/database.service';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Get all events with filters
router.get('/', async (req, res, next) => {
  try {
    const { category, date, venue, search, page, limit } = req.query;
    
    // If pagination is requested
    if (page && limit) {
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const offset = (pageNum - 1) * limitNum;
      
      let whereConditions = ['e.status = ?', 'e.date_time > NOW()'];
      let params: any[] = ['active'];
      
      if (category) {
        whereConditions.push('e.category = ?');
        params.push(category);
      }
      
      if (venue) {
        whereConditions.push('e.venue LIKE ?');
        params.push(`%${venue}%`);
      }
      
      if (search) {
        whereConditions.push('(e.name LIKE ? OR e.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (date) {
        whereConditions.push('DATE(e.date_time) = ?');
        params.push(date);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const [events] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          e.*,
          u.name as organizer_name,
          (e.capacity - COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0)) as available_tickets,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.tickets_booked ELSE 0 END), 0) as tickets_sold
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN bookings b ON e.id = b.event_id
        WHERE ${whereClause}
        GROUP BY e.id
        ORDER BY e.date_time ASC
        LIMIT ? OFFSET ?
      `, [...params, limitNum, offset]);
      
      const [countResult] = await pool.execute<RowDataPacket[]>(`
        SELECT COUNT(DISTINCT e.id) as total
        FROM events e
        WHERE ${whereClause}
      `, params);
      
      return res.json({
        events,
        total: (countResult[0] as any).total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((countResult[0] as any).total / limitNum)
      });
    }
    
    // Original non-paginated response
    let events = await db.getAllEvents();
    
    // Apply filters
    if (category) {
      events = events.filter(e => e.category === category);
    }

    if (date) {
      events = events.filter(e => {
        const eventDate = new Date(e.date_time).toDateString();
        const filterDate = new Date(date as string).toDateString();
        return eventDate === filterDate;
      });
    }

    if (venue) {
      events = events.filter(e => 
        e.venue.toLowerCase().includes((venue as string).toLowerCase())
      );
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      events = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm) ||
        (e.description && e.description.toLowerCase().includes(searchTerm))
      );
    }

    res.json(events);
  } catch (error) {
    next(error);
  }
});

// Get event by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await db.findEventById(parseInt(id));

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Create event (organizers only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('organizer'),
  validateRequest(schemas.createEvent),
  async (req: AuthRequest, res, next) => {
    try {
      const { name, description, venue, date_time, category, capacity, ticket_price, image_url } = req.body;
      const organizer_id = req.user!.id;

      // Additional validation for future date
      const eventDateTime = new Date(date_time);
      const now = new Date();
      
      if (eventDateTime <= now) {
        return res.status(400).json({
          error: 'Validation Error',
          details: ['Event date and time must be in the future']
        });
      }

      const eventId = await db.createEvent({
        organizer_id,
        name: name.trim(),
        description: description?.trim() || '',
        venue: venue.trim(),
        date_time: eventDateTime,
        category,
        capacity: parseInt(capacity),
        ticket_price: parseFloat(ticket_price),
        image_url: image_url || null,
        status: 'active'
      });

      res.status(201).json({
        message: 'Event created successfully',
        event_id: eventId
      });
    } catch (error) {
      console.error('Event creation error:', error);
      next(error);
    }
  }
);

// Get organizer's events
router.get('/organizer/my-events',
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res, next) => {
    try {
      const organizerId = req.user!.id;
      const events = await db.getEventsByOrganizer(organizerId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  }
);

// Get organizer dashboard statistics
router.get('/organizer/dashboard-stats',
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res, next) => {
    try {
      const organizerId = req.user!.id;
      const stats = await db.getOrganizerStats(organizerId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Update event (organizers only)
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('organizer'),
  validateRequest(schemas.updateEvent),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, venue, date_time, category, capacity, ticket_price, image_url } = req.body;
      const organizer_id = req.user!.id;

      // Check if event exists and belongs to organizer
      const existingEvent = await db.findEventById(parseInt(id));
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.organizer_id !== organizer_id) {
        return res.status(403).json({ error: 'Not authorized to update this event' });
      }

      const success = await db.updateEvent(parseInt(id), {
        name,
        description,
        venue,
        date_time: new Date(date_time),
        category,
        capacity,
        ticket_price,
        image_url
      });

      if (!success) {
        return res.status(400).json({ error: 'Failed to update event' });
      }

      res.json({
        message: 'Event updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Cancel/Delete event (organizers only)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const organizer_id = req.user!.id;

      // Check if event exists and belongs to organizer
      const existingEvent = await db.findEventById(parseInt(id));
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.organizer_id !== organizer_id) {
        return res.status(403).json({ error: 'Not authorized to delete this event' });
      }

      const success = await db.cancelEvent(parseInt(id));

      if (!success) {
        return res.status(400).json({ error: 'Failed to cancel event' });
      }

      res.json({
        message: 'Event cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;