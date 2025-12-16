import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent,
  getOrganizerEvents,
} from "../controllers/eventController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
// GET /api/events - Get all events (with optional filters)
router.get("/", getAllEvents);

// Protected routes - Organizer only (MUST BE BEFORE /:id)
// GET /api/events/organizer/my-events - Get organizer's events
router.get(
  "/organizer/my-events",
  authenticateToken,
  authorizeRole("organizer", "admin"),
  getOrganizerEvents
);

// GET /api/events/:id - Get single event details
router.get("/:id", getEventById);

// POST /api/events - Create new event
router.post(
  "/",
  authenticateToken,
  authorizeRole("organizer", "admin"),
  createEvent
);

// PUT /api/events/:id - Update event
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("organizer", "admin"),
  updateEvent
);

// DELETE /api/events/:id - Cancel event
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("organizer", "admin"),
  cancelEvent
);

export default router;
