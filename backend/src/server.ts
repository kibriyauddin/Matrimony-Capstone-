import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { db } from './services/database.service';
import { emailService } from './services/email.service';
import { reminderService } from './services/reminder.service';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import emailTestRoutes from './routes/email-test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://127.0.0.1:4200', 'http://127.0.0.1:4201'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email-test', emailTestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Event Planner API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database (create admin user if needed)
    await db.initializeDatabase();
    
    // Initialize reminder service database column
    await reminderService.initializeReminderColumn();
    
    // Test email service connection
    const emailConnected = await emailService.testConnection();
    if (emailConnected) {
      console.log('Email service connected successfully');
      // Start reminder service
      reminderService.start();
    } else {
      console.log('Email service connection failed - reminders disabled');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS enabled for: http://localhost:4200`);
      console.log(`Database: MySQL connected successfully`);
      console.log(`Email service: ${emailConnected ? 'Connected' : 'Disabled (check SMTP configuration)'}`);
      console.log(`Reminder service: ${emailConnected ? 'Active' : 'Disabled'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.log('Falling back to mock database for development...');
    
    // Start server without database for development
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Mock Database Mode)`);
      console.log(`CORS enabled for: http://localhost:4200`);
    });
  }
};

startServer();