import { Request, Response, NextFunction } from 'express';
import { fetchEvents, fetchEventAttendees } from '../services/event.service';

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await fetchEvents(req.query);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = Number(req.params.eventId);
    const data = await fetchEventAttendees(eventId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
