import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('attendee', 'organizer').default('attendee')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createEvent: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow('').max(1000).optional(),
    venue: Joi.string().min(3).max(200).required(),
    date_time: Joi.string().isoDate().required(),
    category: Joi.string().valid('Music', 'Workshop', 'Conference', 'Sports', 'Technology', 'Business', 'Arts & Culture', 'Food & Drink', 'Health & Wellness', 'Education', 'Entertainment', 'Networking', 'Charity', 'Fashion', 'Travel', 'Other').required(),
    capacity: Joi.number().integer().min(1).max(10000).required(),
    ticket_price: Joi.number().min(0).max(100000).required(),
    image_url: Joi.string().allow('', null).optional()
  }),

  updateEvent: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow('').max(1000).optional(),
    venue: Joi.string().min(3).max(200).optional(),
    date_time: Joi.string().isoDate().optional(),
    category: Joi.string().valid('Music', 'Workshop', 'Conference', 'Sports', 'Technology', 'Business', 'Arts & Culture', 'Food & Drink', 'Health & Wellness', 'Education', 'Entertainment', 'Networking', 'Charity', 'Fashion', 'Travel', 'Other').optional(),
    capacity: Joi.number().integer().min(1).max(10000).optional(),
    ticket_price: Joi.number().min(0).max(100000).optional(),
    image_url: Joi.string().allow('', null).optional()
  }),

  bookTicket: Joi.object({
    event_id: Joi.number().integer().positive().required(),
    tickets_booked: Joi.number().integer().min(1).required()
  })
};