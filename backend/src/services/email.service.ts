import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface BookingEmailData {
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketsBooked: number;
  totalPrice: number;
  bookingId: number;
  qrCode: string;
}

export interface ReminderEmailData {
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketsBooked: number;
}

export interface CancellationEmailData {
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  eventDate: string;
  ticketsBooked: number;
  refundAmount: number;
  bookingId: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isEmailEnabled: boolean;

  constructor() {
    // Check if email credentials are properly configured
    this.isEmailEnabled = !!(process.env.SMTP_USER && process.env.SMTP_PASS && 
                            process.env.SMTP_PASS !== 'your_app_password' &&
                            process.env.SMTP_PASS !== 'your_16_character_app_password_here' &&
                            process.env.SMTP_PASS !== 'paste_your_16_character_app_password_here');

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(__dirname, '..', 'templates', `${templateName}.html`);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return this.getDefaultTemplate(templateName);
    }
  }

  private getDefaultTemplate(templateName: string): string {
    switch (templateName) {
      case 'booking-confirmation':
        return `
          <h2>🎫 Booking Confirmation</h2>
          <p>Dear {{attendeeName}},</p>
          <p>Your booking has been confirmed!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> {{eventName}}</p>
            <p><strong>Date:</strong> {{eventDate}} at {{eventTime}}</p>
            <p><strong>Venue:</strong> {{venue}}</p>
            <p><strong>Tickets:</strong> {{ticketsBooked}}</p>
            <p><strong>Total Paid:</strong> ₹{{totalPrice}}</p>
            <p><strong>Booking ID:</strong> #{{bookingId}}</p>
          </div>
          <p>Please show your QR code at the event entrance.</p>
          <p>Thank you for choosing Smart Event Planner!</p>
        `;
      case 'event-reminder':
        return `
          <h2>⏰ Event Reminder</h2>
          <p>Dear {{attendeeName}},</p>
          <p>This is a friendly reminder that your event is tomorrow!</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> {{eventName}}</p>
            <p><strong>Date:</strong> {{eventDate}} at {{eventTime}}</p>
            <p><strong>Venue:</strong> {{venue}}</p>
            <p><strong>Your Tickets:</strong> {{ticketsBooked}}</p>
          </div>
          <p>Don't forget to bring your QR code!</p>
          <p>See you there!</p>
        `;
      case 'cancellation-confirmation':
        return `
          <h2>❌ Booking Cancelled</h2>
          <p>Dear {{attendeeName}},</p>
          <p>Your booking has been successfully cancelled.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancellation Details:</h3>
            <p><strong>Event:</strong> {{eventName}}</p>
            <p><strong>Date:</strong> {{eventDate}}</p>
            <p><strong>Tickets Cancelled:</strong> {{ticketsBooked}}</p>
            <p><strong>Refund Amount:</strong> ₹{{refundAmount}}</p>
            <p><strong>Booking ID:</strong> #{{bookingId}}</p>
          </div>
          <p>Your refund will be processed within 5-7 business days.</p>
          <p>Thank you for using Smart Event Planner!</p>
        `;
      default:
        return '<p>Email template not found.</p>';
    }
  }

  private replaceTemplateVariables(template: string, data: any): string {
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    try {
      const template = this.loadTemplate('booking-confirmation');
      const htmlContent = this.replaceTemplateVariables(template, data);

      const mailOptions = {
        from: `"Smart Event Planner" <${process.env.SMTP_USER}>`,
        to: data.attendeeEmail,
        subject: `🎫 Booking Confirmed - ${data.eventName}`,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Booking confirmation email sent to ${data.attendeeEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return false;
    }
  }

  async sendEventReminder(data: ReminderEmailData): Promise<boolean> {
    try {
      const template = this.loadTemplate('event-reminder');
      const htmlContent = this.replaceTemplateVariables(template, data);

      const mailOptions = {
        from: `"Smart Event Planner" <${process.env.SMTP_USER}>`,
        to: data.attendeeEmail,
        subject: `⏰ Event Reminder - ${data.eventName} is Tomorrow!`,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Event reminder email sent to ${data.attendeeEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending event reminder email:', error);
      return false;
    }
  }

  async sendCancellationConfirmation(data: CancellationEmailData): Promise<boolean> {
    const emailType = 'CANCELLATION_CONFIRMATION';
    
    console.log(`📧 [${new Date().toISOString()}] Attempting to send ${emailType} to ${data.attendeeEmail}`);
    console.log(`📧 Event: ${data.eventName}, Booking ID: ${data.bookingId}, Refund: ₹${data.refundAmount}`);
    
    if (!this.isEmailEnabled) {
      console.log(`📧 Email service is DISABLED - Would have sent ${emailType} to ${data.attendeeEmail}`);
      console.log(`📧 Email content preview: Booking #${data.bookingId} for "${data.eventName}" cancelled, refund ₹${data.refundAmount}`);
      return false;
    }

    try {
      const template = this.loadTemplate('cancellation-confirmation');
      const htmlContent = this.replaceTemplateVariables(template, data);

      const mailOptions = {
        from: `"Smart Event Planner" <${process.env.SMTP_USER}>`,
        to: data.attendeeEmail,
        subject: `❌ Booking Cancelled - ${data.eventName}`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ [${new Date().toISOString()}] ${emailType} sent successfully to ${data.attendeeEmail}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Failed to send ${emailType} to ${data.attendeeEmail}:`, error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();