# 🎉 Smart Event Planner Platform

A comprehensive event management platform built with **Angular 18** and **Node.js + TypeScript**, featuring role-based access control, real-time booking management, and automated email notifications.

## 🚀 Features

### **For Attendees**
- 🎫 Browse and search events by category, date, and venue
- 📅 Book tickets with real-time availability checking
- 📧 Receive booking confirmations with QR codes
- 📱 View booking history and manage reservations
- 🔔 Get automated event reminders 24 hours before events

### **For Organizers**
- 📊 Comprehensive dashboard with real-time statistics
- ✨ Create and manage events with image uploads
- 👥 View attendee lists and manage bookings
- 📈 Track revenue and booking analytics
- 📧 Send test emails and manage notifications

### **System Features**
- 🔐 JWT-based authentication with role-based access control
- 🛡️ Comprehensive input validation and error handling
- 📧 Professional HTML email templates with QR codes
- 💳 Indian Rupee (₹) currency support
- 📱 Fully responsive design with modern UI/UX
- 🔄 Real-time data updates and loading states

## 🛠️ Technology Stack

### **Frontend**
- **Angular 18** with standalone components
- **Angular Material** for UI components
- **TypeScript** with strict mode
- **RxJS** for reactive programming
- **CSS** for styling (no SCSS)

### **Backend**
- **Node.js** with **TypeScript**
- **Express.js** framework
- **MySQL** database with connection pooling
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **QRCode** generation for bookings

### **Database**
- **MySQL** with proper indexing
- Foreign key constraints
- Optimized queries with JOINs
- Base64 image storage

## 📁 Project Structure

```
smart-event-planner/
├── frontend/                 # Angular 18 application
│   ├── src/app/
│   │   ├── auth/            # Authentication components
│   │   ├── events/          # Event browsing and details
│   │   ├── bookings/        # Booking management
│   │   ├── organizer/       # Organizer-specific features
│   │   ├── services/        # Shared services
│   │   ├── guards/          # Route guards
│   │   └── models/          # TypeScript interfaces
│   └── ...
├── backend/                  # Node.js + TypeScript API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── templates/       # Email templates
│   │   └── types/           # TypeScript type definitions
│   └── ...
└── database/                 # Database schema and migrations
    └── schema.sql
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-event-planner.git
   cd smart-event-planner
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database and email credentials
   
   # Build and start
   npm run build
   npm start
   ```

3. **Setup Database**
   ```bash
   # Import the database schema
   mysql -u root -p < database/schema.sql
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   ng serve --port 4201
   ```

### **Environment Configuration**

#### **Backend (.env)**
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_planner
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📚 API Documentation

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Events**
- `GET /api/events` - Get all events (with pagination and filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizers only)
- `PUT /api/events/:id` - Update event (organizers only)
- `DELETE /api/events/:id` - Cancel event (organizers only)

### **Bookings**
- `POST /api/bookings` - Book tickets
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/booking/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking

### **Organizer Dashboard**
- `GET /api/events/organizer/my-events` - Get organizer's events
- `GET /api/events/organizer/dashboard-stats` - Get dashboard statistics
- `GET /api/bookings/event/:id/attendees` - Get event attendees

## 🔐 Security Features

- **JWT Authentication** with role-based access control
- **Password Hashing** with bcrypt
- **Input Validation** using Joi schemas
- **SQL Injection Prevention** with parameterized queries
- **CORS Configuration** for secure cross-origin requests
- **Route Guards** for frontend protection

## 🎨 UI/UX Features

- **Modern Design** with purple/blue gradients
- **Glass-morphism Effects** for cards and modals
- **Responsive Design** for all devices
- **Loading States** and error handling
- **Real-time Feedback** for user actions
- **Accessibility Compliant** components

## 📧 Email System

- **Professional HTML Templates** for all notifications
- **QR Code Generation** for booking confirmations
- **Automated Reminders** 24 hours before events
- **Cancellation Confirmations** with refund information
- **SMTP Configuration** with Gmail support

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
ng test
```

## 🚀 Deployment

### **Production Build**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
ng build --configuration production
```

### **Environment Setup**
- Backend runs on port **3001**
- Frontend runs on port **4201**
- Configure MySQL database
- Set up SMTP credentials for email service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Node.js community for excellent packages
- MySQL for reliable database management
- All contributors and testers

---

⭐ **Star this repository if you found it helpful!**