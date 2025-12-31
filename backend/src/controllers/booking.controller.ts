import { Request, Response } from "express";
import pool from "../config/db";

// BOOK TICKETS
export const bookTickets = async (req: Request, res: Response) => {
  try {
    const { event_id, attendee_id, tickets_booked } = req.body;

    if (!event_id || !attendee_id || !tickets_booked) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Get event details
    const [events]: any = await pool.query(
      "SELECT capacity, ticket_price FROM events WHERE id = ?",
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { capacity, ticket_price } = events[0];

    // 2️⃣ Get total tickets already booked
    const [bookings]: any = await pool.query(
      "SELECT SUM(tickets_booked) AS totalBooked FROM bookings WHERE event_id = ?",
      [event_id]
    );

    const totalBooked = bookings[0].totalBooked || 0;

    // 3️⃣ Check availability
    if (totalBooked + tickets_booked > capacity) {
      return res.status(400).json({
        message: "Not enough seats available",
      });
    }

    // 4️⃣ Calculate total price
    const total_price = ticket_price * tickets_booked;

    // 5️⃣ Insert booking
    const [result]: any = await pool.query(
      `INSERT INTO bookings 
      (event_id, attendee_id, tickets_booked, total_price)
      VALUES (?, ?, ?, ?)`,
      [event_id, attendee_id, tickets_booked, total_price]
    );

    res.status(201).json({
      message: "Booking confirmed",
      booking_id: result.insertId,
      total_price,
    });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error });
  }
};

// GET BOOKING BY ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      "SELECT * FROM bookings WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking", error });
  }
};
