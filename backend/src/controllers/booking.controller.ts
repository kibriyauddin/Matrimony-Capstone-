import { Request, Response, NextFunction } from 'express';
import { bookTickets } from '../services/booking.service';

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await bookTickets(req.body);
    res.status(201).json({
      message: 'Booking successful',
      booking
    });
  } catch (error) {
    next(error);
  }
};
