import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getEventAttendees
} from '../controllers/bookingController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes - Attendee
// POST /api/bookings - Create new booking
router.post('/', authenticateToken, createBooking);

// GET /api/bookings - Get user's bookings
router.get('/', authenticateToken, getUserBookings);

// GET /api/bookings/:id - Get single booking details
router.get('/:id', authenticateToken, getBookingById);

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authenticateToken, cancelBooking);

// Protected routes - Organizer only
// GET /api/bookings/event/:eventId/attendees - Get all attendees for an event
router.get('/event/:eventId/attendees', authenticateToken, authorizeRole('organizer', 'admin'), getEventAttendees);

export default router;