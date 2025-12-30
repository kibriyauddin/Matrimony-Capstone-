import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface CancellationEmailData {
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  eventDate: string;
  ticketsBooked: number;
  refundAmount: number;
  bookingId: number;
  cancellationReason?: string;
}

class EmailTestService {
  private transporter: nodemailer.Transporter | null = null;
  private isEmailEnabled: boolean;

  constructor() {
    // Check if email credentials are properly configured
    this.isEmailEnabled = !!(process.env.SMTP_USER && process.env.SMTP_PASS && 
                            process.env.SMTP_PASS !== 'your_app_password' &&
                            process.env.SMTP_PASS !== 'your_16_character_app_password_here' &&
                            process.env.SMTP_PASS !== 'paste_your_16_character_app_password_here');

    console.log('📧 Email Service Configuration Check:');
    console.log(`📧 SMTP_USER: ${process.env.SMTP_USER ? '✅ Set' : '❌ Missing'}`);
    console.log(`📧 SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Missing'}`);
    console.log(`📧 Email Enabled: ${this.isEmailEnabled ? '✅ YES' : '❌ NO'}`);

    if (this.isEmailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.verifyConnection();
    } else {
      console.log('📧 Email service is DISABLED - Update .env file with valid SMTP credentials');
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ Email service connection verified successfully');
      }
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      this.isEmailEnabled = false;
    }
  }

  async testCancellationEmail(data: CancellationEmailData): Promise<{ success: boolean; message: string; details?: any }> {
    const timestamp = new Date().toISOString();
    
    console.log(`\n📧 [${timestamp}] TESTING CANCELLATION EMAIL`);
    console.log(`📧 Recipient: ${data.attendeeEmail}`);
    console.log(`📧 Event: ${data.eventName}`);
    console.log(`📧 Booking ID: ${data.bookingId}`);
    console.log(`📧 Refund Amount: ₹${data.refundAmount}`);
    console.log(`📧 Reason: ${data.cancellationReason || 'No reason provided'}`);

    if (!this.isEmailEnabled) {
      const message = 'Email service is disabled - check SMTP configuration';
      console.log(`❌ ${message}`);
      return {
        success: false,
        message,
        details: {
          emailEnabled: false,
          smtpUser: process.env.SMTP_USER,
          smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
        }
      };
    }

    if (!this.transporter) {
      const message = 'Email transporter not initialized';
      console.log(`❌ ${message}`);
      return { success: false, message };
    }

    try {
      // Load and process template
      const template = this.loadTemplate('cancellation-confirmation');
      const htmlContent = this.replaceTemplateVariables(template, data);

      const mailOptions = {
        from: `"Smart Event Planner" <${process.env.SMTP_USER}>`,
        to: data.attendeeEmail,
        subject: `❌ Booking Cancelled - ${data.eventName}`,
        html: htmlContent,
      };

      console.log(`📧 Sending email...`);
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully!`);
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📧 Response: ${result.response}`);

      return {
        success: true,
        message: 'Cancellation email sent successfully',
        details: {
          messageId: result.messageId,
          response: result.response,
          recipient: data.attendeeEmail
        }
      };

    } catch (error: any) {
      console.error(`❌ Failed to send cancellation email:`, error);
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
        details: error
      };
    }
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(__dirname, '..', 'templates', `${templateName}.html`);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return this.getDefaultCancellationTemplate();
    }
  }

  private getDefaultCancellationTemplate(): string {
    return `
      <h2>❌ Booking Cancelled</h2>
      <p>Dear {{attendeeName}},</p>
      <p>Your booking has been cancelled.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Cancellation Details:</h3>
        <p><strong>Event:</strong> {{eventName}}</p>
        <p><strong>Date:</strong> {{eventDate}}</p>
        <p><strong>Tickets Cancelled:</strong> {{ticketsBooked}}</p>
        <p><strong>Refund Amount:</strong> ₹{{refundAmount}}</p>
        <p><strong>Booking ID:</strong> #{{bookingId}}</p>
        {{#if cancellationReason}}
        <p><strong>Reason:</strong> {{cancellationReason}}</p>
        {{/if}}
      </div>
      <p>Your refund will be processed within 5-7 business days.</p>
      <p>Thank you for using Smart Event Planner!</p>
    `;
  }

  private replaceTemplateVariables(template: string, data: any): string {
    let html = template;
    
    // Replace all template variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });

    // Handle conditional blocks for cancellationReason
    if (data.cancellationReason) {
      html = html.replace(/{{#if cancellationReason}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if cancellationReason}}([\s\S]*?){{\/if}}/g, '');
    }

    return html;
  }

  getEmailStatus(): { enabled: boolean; configured: boolean; details: any } {
    return {
      enabled: this.isEmailEnabled,
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      details: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || 'Not configured',
        hasPassword: !!process.env.SMTP_PASS,
        transporterReady: !!this.transporter
      }
    };
  }
}

export const emailTestService = new EmailTestService();