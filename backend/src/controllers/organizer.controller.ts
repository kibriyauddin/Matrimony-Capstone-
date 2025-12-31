import { Request, Response } from "express";
import pool from "../config/db";

// GET ATTENDEES FOR AN EVENT
export const getAttendeesByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query(
      `SELECT attendee_id, tickets_booked, booking_time
       FROM bookings
       WHERE event_id = ?`,
      [eventId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendees", error });
  }
};

// GET SALES SUMMARY FOR AN EVENT
export const getEventSalesSummary = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const [rows]: any = await pool.query(
      `SELECT 
         SUM(tickets_booked) AS total_tickets_sold,
         SUM(total_price) AS total_revenue
       FROM bookings
       WHERE event_id = ?`,
      [eventId]
    );

    res.json({
      event_id: eventId,
      total_tickets_sold: rows[0].total_tickets_sold || 0,
      total_revenue: rows[0].total_revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales summary", error });
  }
};
