# Smart Event Planner

A full-stack event management platform I built for my capstone project. Users can discover events, book tickets, and organizers can manage their events with a clean dashboard.

## What it does

This is basically an event booking platform where people can find events they want to attend and book tickets online. Event organizers get their own dashboard to create events, see who's coming, and manage everything.

The cool part is that it sends actual emails with QR codes when you book tickets, and reminds you about events 24 hours before they happen.

## Tech I used

**Frontend:**
- Angular 18 
- TypeScript 

**Backend:**
- Node.js with Express
- TypeScript 
- MySQL database
- JWT for authentication
- Nodemailer for sending emails

## Features

**For regular users:**
- Browse events by category or search
- Book tickets and get email confirmations
- See your booking history
- Cancel bookings (but only up to 24 hours before)
- Get reminder emails

**For event organizers:**
- Create and manage events
- See who's registered for your events
- View analytics and revenue
- Cancel bookings if needed
- Test email functionality

## Event types supported

16 different event categories

Music, Workshop, Conference, Sports, Technology, Business, Arts & Culture, Food & Drink, Health & Wellness, Education, Entertainment, Networking, Charity, Fashion, Travel, and Other.

## How to run it

You'll need Node.js and MySQL installed.

1. Clone this repo
2. Set up the database:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Backend setup:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit the .env file with your database and email settings
   npm run dev
   ```

4. Frontend setup:
   ```bash
   cd frontend
   npm install
   ng serve --port 4201
   ```

The app runs on http://localhost:4201 and the API is on http://localhost:3002.

## Environment setup

Create a `.env` file in the backend folder:

```
PORT=3002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_planner
JWT_SECRET=some_random_secret_key

# For email features (optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Database

The database has three main tables:
- `users` - handles authentication and roles (attendee or organizer)
- `events` - stores all event information
- `bookings` - tracks who booked what

I kept it simple with just two user roles.

## Testing

Added test files for all components:
```bash
# Frontend tests
cd frontend
npm test

# Backend tests  
cd backend
npm test
```

## Deployment notes

- Frontend builds to static files that can be served anywhere
- Backend needs Node.js environment
- Database needs MySQL 8.0+
- Email features need SMTP configuration

## Future improvements

- Payment integration
- Event reviews and ratings
- Social media sharing
- Mobile app version
- Advanced analytics
