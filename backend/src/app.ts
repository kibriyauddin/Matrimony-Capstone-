import express, { Application } from 'express';
import cors from 'cors';

import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

/* ---------- Global Middlewares ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Health Check ---------- */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'UP', message: 'Smart Event Planner API running' });
});

/* ---------- API Routes ---------- */
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

/* ---------- Error Handler (MUST BE LAST) ---------- */
app.use(errorHandler);

export default app;
