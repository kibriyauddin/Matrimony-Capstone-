import { db } from './database.service';
import { emailService } from './email.service';

class ReminderService {
  private reminderInterval: NodeJS.Timeout | null = null;

  // Start the reminder service (check every hour)
  start(): void {
    console.log('Starting email reminder service...');
    
    // Run immediately on start
    this.checkAndSendReminders();
    
    // Then run every hour
    this.reminderInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  }

  // Stop the reminder service
  stop(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('Email reminder service stopped');
    }
  }

  // Check for events happening tomorrow and send reminders
  private async checkAndSendReminders(): Promise<void> {
    try {
      console.log('Checking for events that need reminders...');
      
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);

      // Query to get all confirmed bookings for events happening tomorrow
      const query = `
        SELECT 
          b.id as booking_id,
          b.tickets_booked,
          b.attendee_id,
          e.name as event_name,
          e.date_time as event_date,
          e.venue,
          u.name as attendee_name,
          u.email as attendee_email
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        JOIN users u ON b.attendee_id = u.id
        WHERE b.status = 'confirmed'
        AND e.status = 'active'
        AND e.date_time >= ?
        AND e.date_time < ?
      `;

      const [rows] = await db.pool.execute(query, [tomorrowStart, tomorrowEnd]);
      const bookings = rows as any[];

      console.log(`Found ${bookings.length} bookings that need reminders`);

      // Send reminder emails
      for (const booking of bookings) {
        try {
          const emailData = {
            attendeeName: booking.attendee_name,
            attendeeEmail: booking.attendee_email,
            eventName: booking.event_name,
            eventDate: new Date(booking.event_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            eventTime: new Date(booking.event_date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            venue: booking.venue,
            ticketsBooked: booking.tickets_booked
          };

          const emailSent = await emailService.sendEventReminder(emailData);
          
          if (emailSent) {
            // Mark reminder as sent
            await this.markReminderSent(booking.booking_id);
            console.log(`Reminder sent to ${booking.attendee_email} for ${booking.event_name}`);
          }
        } catch (error) {
          console.error(`Failed to send reminder for booking ${booking.booking_id}:`, error);
        }
      }

      if (bookings.length > 0) {
        console.log(`Successfully processed ${bookings.length} reminder emails`);
      }
    } catch (error) {
      console.error('Error in reminder service:', error);
    }
  }

  // Mark reminder as sent for a booking
  private async markReminderSent(bookingId: number): Promise<void> {
    try {
      // Try to update reminder_sent column, ignore if column doesn't exist
      await db.pool.execute(
        'UPDATE bookings SET reminder_sent = 1 WHERE id = ?',
        [bookingId]
      );
    } catch (error) {
      // Ignore error if column doesn't exist - reminders will still work
      console.log(`⚠️  Note: reminder_sent column not available for booking ${bookingId}`);
    }
  }

  // Add reminder_sent column to bookings table if it doesn't exist
  async initializeReminderColumn(): Promise<void> {
    try {
      // First check if column exists
      const [columns] = await db.pool.execute(`
        SHOW COLUMNS FROM bookings LIKE 'reminder_sent'
      `);
      
      if ((columns as any[]).length === 0) {
        // Column doesn't exist, add it
        await db.pool.execute(`
          ALTER TABLE bookings 
          ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0
        `);
        console.log('✅ Added reminder_sent column to bookings table');
      } else {
        console.log('✅ reminder_sent column already exists');
      }
    } catch (error) {
      console.error('❌ Error initializing reminder column:', error);
      // Don't throw error - let the service continue without this feature
    }
  }

  // Manual method to send reminders (for testing)
  async sendTestReminders(): Promise<void> {
    console.log('Sending test reminders...');
    await this.checkAndSendReminders();
  }
}

export const reminderService = new ReminderService();