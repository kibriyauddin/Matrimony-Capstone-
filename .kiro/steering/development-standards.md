---
inclusion: always
---

# Development Standards for Smart Event Planner Platform

## Code Standards

### Frontend (Angular 18)
- Use standalone components architecture
- Implement TypeScript strict mode
- Use CSS for styling (not SCSS)
- Follow Angular style guide conventions
- Implement proper error handling and loading states
- Use reactive forms for user input
- Implement proper component lifecycle management

### Backend (Node.js + TypeScript)
- Use Express.js with TypeScript
- Implement proper middleware for authentication and validation
- Use environment variables for configuration
- Follow RESTful API design principles
- Implement proper error handling and logging
- Use connection pooling for database operations

### Database (MySQL)
- Use proper indexing for performance
- Implement foreign key constraints
- Use LONGTEXT for base64 image storage
- Follow naming conventions (snake_case for columns)
- Implement proper transaction handling

## Project Structure

### Frontend Structure
```
frontend/src/app/
├── auth/                 # Authentication components
├── events/              # Event browsing and details
├── bookings/            # Booking management
├── organizer/           # Organizer-specific features
├── admin/               # Admin dashboard
├── layout/              # Layout components
├── services/            # Shared services
├── guards/              # Route guards
└── models/              # TypeScript interfaces
```

### Backend Structure
```
backend/src/
├── config/              # Configuration files
├── middleware/          # Express middleware
├── routes/              # API route handlers
├── services/            # Business logic services
├── templates/           # Email templates
└── types/               # TypeScript type definitions
```

## UI/UX Guidelines

### Design Principles
- Use modern gradient themes (purple/blue gradients preferred)
- Implement glass-morphism effects for cards and modals
- Ensure responsive design across all devices
- Use consistent spacing and typography
- Implement smooth animations and transitions
- Provide clear loading states and feedback

### Navigation
- Role-based navigation menus
- Conditional navbar hiding for specific pages (attendees view)
- Breadcrumb navigation where appropriate
- Clear call-to-action buttons

### Forms
- Use Angular Material components
- Implement proper validation with user-friendly messages
- Provide real-time feedback during input
- Use consistent button styling and placement

## Currency and Localization
- Use Indian Rupees (₹) as the primary currency
- Format numbers with proper decimal places
- Use 24-hour time format for event scheduling
- Implement proper date formatting

## Email System
- Use professional HTML templates
- Include event details and QR codes in booking confirmations
- Send automated reminders 24 hours before events
- Implement cancellation confirmation emails
- Use environment variables for SMTP configuration

## File Upload Standards
- Support drag-and-drop interface
- Validate file types and sizes
- Provide upload progress indicators
- Store images as base64 in LONGTEXT columns
- Implement image preview functionality

## Security Best Practices
- Use JWT tokens for authentication
- Hash passwords with bcrypt
- Implement proper input validation and sanitization
- Use role-based authorization
- Configure CORS properly
- Sanitize database queries to prevent SQL injection

## Performance Guidelines
- Optimize database queries with proper joins
- Implement efficient search and filtering
- Use connection pooling for database operations
- Optimize image handling for base64 storage
- Implement proper caching strategies

## Testing Standards
- Test all authentication flows
- Verify booking process edge cases
- Test file upload functionality
- Validate email notification system
- Ensure responsive design across devices
- Test role-based access control

## Environment Configuration
- Use separate .env files for development and production
- Configure database connections properly
- Set up email service credentials
- Configure proper CORS origins
- Set appropriate JWT secrets and expiration times

## Deployment Considerations
- Backend runs on port 3001
- Frontend runs on port 4201
- Ensure MySQL database is properly configured
- Set up proper environment variables
- Configure email service with valid SMTP credentials
- Implement proper logging for production monitoring

## Maintenance Guidelines
- Regular database backups
- Monitor email delivery rates
- Keep dependencies updated
- Monitor application performance
- Implement proper error logging and monitoring
- Regular security audits and updates