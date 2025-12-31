import { Request, Response } from "express";
import pool from "../config/db";

// CREATE EVENT
export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      organizer_id,
      name,
      description,
      venue,
      date_time,
      category,
      capacity,
      ticket_price,
    } = req.body;

    // Basic validation
    if (
      !organizer_id ||
      !name ||
      !venue ||
      !date_time ||
      !capacity ||
      !ticket_price
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result]: any = await pool.query(
      `INSERT INTO events 
      (organizer_id, name, description, venue, date_time, category, capacity, ticket_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizer_id,
        name,
        description,
        venue,
        date_time,
        category,
        capacity,
        ticket_price,
      ]
    );

    res.status(201).json({
      message: "Event created successfully",
      event_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error });
  }
};

// GET ALL EVENTS
export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const [events] = await pool.query("SELECT * FROM events");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
};

// GET EVENT BY ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error });
  }
};
