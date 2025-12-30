import express, { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { db } from '../services/database.service';
import { emailService } from '../services/email.service';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Book tickets
router.post('/',
  authenticateToken,
  validateRequest(schemas.bookTicket),
  async (req: AuthRequest, res, next) => {
    try {
      const { event_id, tickets_booked } = req.body;
      const attendee_id = req.user!.id;

      // Check if event exists and is active
      const event = await db.findEventById(event_id);
      if (!event || event.status !== 'active' || new Date(event.date_time) <= new Date()) {
        return res.status(404).json({ error: 'Event not found or not available for booking' });
      }

      // Check ticket availability
      if (tickets_booked > event.available_tickets) {
        return res.status(400).json({ 
          error: 'Not enough tickets available',
          available: event.available_tickets
        });
      }

      // Calculate total price
      const total_price = event.ticket_price * tickets_booked;

      // Generate QR code data (store just the data, not the image)
      const qrData = `${event_id}-${attendee_id}-${tickets_booked}-${Date.now()}`;
      const qr_code = qrData;

      // Create booking
      const bookingId = await db.createBooking({
        event_id,
        attendee_id,
        tickets_booked,
        total_price,
        qr_code,
        status: 'confirmed'
      });

      // Get user details for email
      const user = await db.findUserById(attendee_id);
      
      // Send booking confirmation email
      if (user) {
        const emailData = {
          attendeeName: user.name,
          attendeeEmail: user.email,
          eventName: event.name,
          eventDate: new Date(event.date_time).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          eventTime: new Date(event.date_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          venue: event.venue,
          ticketsBooked: tickets_booked,
          totalPrice: total_price,
          bookingId: bookingId,
          qrCode: qr_code
        };

        // Send email asynchronously (don't wait for it)
        emailService.sendBookingConfirmation(emailData).catch(error => {
          console.error('Failed to send booking confirmation email:', error);
        });
      }

      res.status(201).json({
        message: 'Booking confirmed successfully',
        booking: {
          id: bookingId,
          event_id,
          tickets_booked,
          total_price,
          qr_code,
          event_name: event.name,
          event_date: event.date_time,
          venue: event.venue
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's bookings
router.get('/my-bookings',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const attendee_id = req.user!.id;
      const bookings = await db.getBookingsByUser(attendee_id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }
);

// Get booking by ID
router.get('/:id',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const booking = await db.findBookingById(parseInt(id));
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user can access this booking
      if (userRole !== 'admin' && booking.attendee_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to view this booking' });
      }

      res.json(booking);
    } catch (error) {
      next(error);
    }
  }
);

// Cancel booking
router.delete('/:id',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const booking = await db.findBookingById(parseInt(id));
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user can cancel this booking
      let canCancel = false;
      
      if (userRole === 'admin') {
        // Admins can cancel any booking
        canCancel = true;
      } else if (booking.attendee_id === userId) {
        // Users can cancel their own bookings
        canCancel = true;
      } else if (userRole === 'organizer') {
        // Organizers can cancel bookings for their own events
        const event = await db.findEventById(booking.event_id);
        if (event && event.organizer_id === userId) {
          canCancel = true;
        }
      }
      
      if (!canCancel) {
        return res.status(403).json({ error: 'Not authorized to cancel this booking' });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Booking is already cancelled' });
      }

      // Check if event is in the future (allow cancellation only for future events)
      const eventDate = new Date(booking.event_date);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // For regular attendees, enforce 24-hour rule
      // For organizers and admins, allow cancellation anytime before the event
      if (booking.attendee_id === userId && hoursUntilEvent < 24) {
        return res.status(400).json({ 
          error: 'Cannot cancel booking less than 24 hours before the event' 
        });
      }

      // Don't allow cancellation of past events for anyone
      if (hoursUntilEvent < 0) {
        return res.status(400).json({ 
          error: 'Cannot cancel booking for past events' 
        });
      }

      const success = await db.cancelBooking(parseInt(id));
      if (!success) {
        return res.status(400).json({ error: 'Failed to cancel booking' });
      }

      // Get cancellation reason from request body
      const { reason } = req.body;
      const cancellationReason = reason || 'No reason provided';

      console.log(`\n📧 BOOKING CANCELLATION INITIATED`);
      console.log(`📧 Booking ID: ${id}`);
      console.log(`📧 Cancelled by: ${req.user?.email} (${req.user?.role})`);
      console.log(`📧 Attendee: ${booking.attendee_name} (${booking.attendee_email})`);
      console.log(`📧 Event: ${booking.event_name}`);
      console.log(`📧 Reason: ${cancellationReason}`);

      // Get user details for email
      const user = await db.findUserById(booking.attendee_id);
      
      // Send cancellation confirmation email
      if (user) {
        const emailData = {
          attendeeName: user.name,
          attendeeEmail: user.email,
          eventName: booking.event_name,
          eventDate: new Date(booking.event_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          ticketsBooked: booking.tickets_booked,
          refundAmount: booking.total_price,
          bookingId: booking.id,
          cancellationReason: cancellationReason
        };

        console.log(`📧 Preparing to send cancellation email to ${user.email}...`);

        // Send email asynchronously (don't wait for it)
        emailService.sendCancellationConfirmation(emailData).then(success => {
          if (success) {
            console.log(`✅ Cancellation email sent successfully to ${user.email}`);
          } else {
            console.log(`❌ Failed to send cancellation email to ${user.email}`);
          }
        }).catch(error => {
          console.error('❌ Error sending cancellation confirmation email:', error);
        });
      } else {
        console.log(`❌ Could not find user details for attendee ID: ${booking.attendee_id}`);
      }

      res.json({ 
        message: 'Booking cancelled successfully',
        refund_amount: booking.total_price,
        refund_note: 'Refund will be processed within 5-7 business days'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get event attendees (organizer/admin only)
router.get('/event/:eventId/attendees',
  authenticateToken,
  async (req: AuthRequest, res, next) => {
    try {
      const { eventId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Check if user can view attendees
      if (userRole !== 'admin') {
        const event = await db.findEventById(parseInt(eventId));
        if (!event || event.organizer_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to view attendees' });
        }
      }

      const attendees = await db.getEventAttendees(parseInt(eventId));
      res.json(attendees);
    } catch (error) {
      next(error);
    }
  }
);

export default router;