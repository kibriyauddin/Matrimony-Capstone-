# API Testing Guide

## 🎉 Your Smart Event Planner is now running!

### Servers Status:
- **Backend API**: http://localhost:3000 ✅
- **Frontend App**: http://localhost:4200 ✅

### Quick API Tests:

1. **Health Check**:
```bash
curl http://localhost:3000/api/health
```

2. **Get Events**:
```bash
curl http://localhost:3000/api/events
```

3. **Register a new user**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "attendee"
  }'
```

4. **Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Frontend Features Available:

1. **Visit**: http://localhost:4200
2. **Register** as an attendee or organizer
3. **Login** with your credentials
4. **Browse Events** - See sample events already loaded
5. **Book Tickets** (after login as attendee)
6. **Create Events** (after login as organizer)

### Sample Data Loaded:
- **Tech Conference 2024** - Dec 31, 2024 at Convention Center ($99.99)
- **Music Festival** - Dec 25, 2024 at City Park ($149.99)

### Default Admin Account:
- Email: admin@eventplanner.com
- Password: (You'll need to set this up)

### Angular 18 Features Demonstrated:

✅ **Component Architecture** - Standalone components
✅ **Data Binding** - All 4 types implemented
✅ **Reactive Forms** - Login/Register with validation
✅ **Angular Material** - Modern UI components
✅ **Bootstrap Grid** - Responsive layout
✅ **Services & DI** - Auth, Event, Booking services
✅ **Routing & Guards** - Role-based access control
✅ **RxJS** - Observables and operators
✅ **Pipes** - Date, currency formatting
✅ **Directives** - Structural and attribute
✅ **Lifecycle Hooks** - Component management
✅ **HTTP Interceptors** - Automatic auth headers

### Next Steps:
1. Open http://localhost:4200 in your browser
2. Register as an organizer to create events
3. Register as an attendee to book tickets
4. Explore the responsive design on mobile
5. Check the browser console for RxJS streams
6. Test the role-based routing guards

Enjoy exploring your Smart Event Planner! 🎫✨