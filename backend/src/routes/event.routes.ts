import { Router } from 'express';
import { db } from '../config/database';

const router = Router();
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         id,
         organizer_id,
         name,
         description,
         venue,
         category,
         capacity,
         date_time,
         created_at
       FROM events
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      organizer_id,
      name,
      description,
      venue,
      date_time,
      category,
      capacity
    } = req.body;

    if (!organizer_id) {
      return res.status(400).json({ message: 'organizer_id is required' });
    }

    const [result] = await db.execute(
      `INSERT INTO events 
       (organizer_id, name, description, venue, date_time, category, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [organizer_id, name, description, venue, date_time, category, capacity]
    );

    res.status(201).json({
      message: 'Event created successfully',
      eventId: (result as any).insertId
    });
  } catch (err) {
    next(err);
  }
});

export default router;
