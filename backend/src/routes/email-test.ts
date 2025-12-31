import express, { Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { emailTestService } from '../services/email-test.service';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Test email configuration
router.get('/status', 
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const status = emailTestService.getEmailStatus();
      res.json({
        message: 'Email service status',
        ...status
      });
    } catch (error) {
      console.error('Error checking email status:', error);
      res.status(500).json({ error: 'Failed to check email status' });
    }
  }
);

// Test cancellation email
router.post('/test-cancellation',
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { attendeeEmail, eventName, reason } = req.body;

      if (!attendeeEmail || !eventName) {
        return res.status(400).json({ 
          error: 'attendeeEmail and eventName are required' 
        });
      }

      // Create test data
      const testData = {
        attendeeName: 'Test User',
        attendeeEmail: attendeeEmail,
        eventName: eventName,
        eventDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        ticketsBooked: 2,
        refundAmount: 1000,
        bookingId: 12345,
        cancellationReason: reason || 'Testing email functionality'
      };

      console.log('\n🧪 TESTING CANCELLATION EMAIL FUNCTIONALITY');
      console.log('🧪 Test initiated by:', req.user?.email);
      
      const result = await emailTestService.testCancellationEmail(testData);

      res.json({
        message: 'Email test completed',
        testResult: result,
        testData: testData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error testing cancellation email:', error);
      res.status(500).json({ 
        error: 'Failed to test cancellation email',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Monitor email logs (last 10 email attempts)
router.get('/logs',
  authenticateToken,
  authorizeRoles('organizer'),
  async (req: AuthRequest, res: Response) => {
    try {
      // This would typically read from a log file or database
      // For now, we'll return the current email status
      const status = emailTestService.getEmailStatus();
      
      res.json({
        message: 'Email service logs',
        currentStatus: status,
        instructions: [
          'Check server console for detailed email logs',
          'Email attempts are logged with timestamps',
          'Look for 📧 prefixed messages in server output'
        ],
        logPatterns: [
          '📧 [timestamp] Email TYPE to recipient: STATUS',
          '✅ SENT - Email delivered successfully',
          '❌ FAILED - Email delivery failed',
          '📧 Email service is DISABLED - Service not configured'
        ]
      });

    } catch (error) {
      console.error('Error getting email logs:', error);
      res.status(500).json({ error: 'Failed to get email logs' });
    }
  }
);

export default router;