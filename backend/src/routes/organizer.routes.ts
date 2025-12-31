import { Router } from "express";
import {
  getAttendeesByEvent,
  getEventSalesSummary,
} from "../controllers/organizer.controller";

const router = Router();

router.get("/events/:eventId/attendees", getAttendeesByEvent);
router.get("/events/:eventId/sales", getEventSalesSummary);

export default router;
