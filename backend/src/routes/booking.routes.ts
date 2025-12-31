import { Router } from "express";
import {
  bookTickets,
  getBookingById,
} from "../controllers/booking.controller";

const router = Router();

router.post("/", bookTickets);      // Book tickets
router.get("/:id", getBookingById); // Booking confirmation

export default router;
