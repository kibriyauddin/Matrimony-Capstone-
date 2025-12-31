import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
} from "../controllers/event.controller";

const router = Router();

router.post("/", createEvent);       // Create event
router.get("/", getAllEvents);        // List events
router.get("/:id", getEventById);     // Event details

export default router;
