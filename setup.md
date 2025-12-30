# Smart Event Planner & Ticketing Platform Setup Guide

## Project Overview
A full-stack event management application built with Angular 18, Node.js (TypeScript), and MySQL featuring:

### Key Features Implemented
- **Authentication & Authorization**: JWT-based with role management (Attendee, Organizer, Admin)
- **Event Management**: Create, update, cancel events with image support
- **Ticket Booking**: QR code generation for ticket confirmation
- **Angular Material UI**: Modern, responsive design with Material Design components
- **Bootstrap Grid**: Responsive layout system
- **Reactive Forms**: Template-driven and reactive forms with custom validators
- **RxJS**: Observables for reactive programming and HTTP operations
- **Route Guards**: Role-based access control
- **Services & Dependency Injection**: Centralized business logic
- **Pipes**: Built-in and custom data transformation
- **Directives**: Structural and attribute directives
- **Component Communication**: Parent-child data binding with @Input/@Output
- **Lifecycle Hooks**: Component lifecycle management
- **State Management**: Centralized state with services (NgRx ready)

## Prerequisites
- Node.js 18+ LTS
- MySQL 8.0+
- Angular CLI 18

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your database credentials:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_planner
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Database Setup
```bash
# Create database and tables
mysql -u root -p < ../database/schema.sql
```

### 4. Start Backend Server
```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Angular 18 Features Implemented

### 1. **Component Architecture**
- Standalone components (no NgModules required)
- Component-based architecture with reusable UI elements
- Lazy loading for performance optimization

### 2. **Data Binding & Forms**
- **Interpolation**: `{{ value }}` for displaying dynamic data
- **Property Binding**: `[property]="value"` for setting element properties
- **Event Binding**: `(event)="handler()"` for handling user interactions
- **Two-way Binding**: `[(ngModel)]="property"` for form inputs
- **Reactive Forms**: FormBuilder, FormGroup, FormControl with validators
- **Template-driven Forms**: NgModel with validation
- **Custom Validators**: Email validation, password matching, no-numbers validator

### 3. **Directives**
- **Structural Directives**: `*ngIf`, `*ngFor`, `*ngSwitch`
- **Attribute Directives**: `[ngClass]`, `[ngStyle]`
- **Custom Directives**: Reusable behavior extensions

### 4. **Pipes**
- **Built-in Pipes**: `date`, `currency`, `titlecase`, `uppercase`, `lowercase`
- **Chaining Pipes**: Multiple transformations
- **Custom Pipes**: Domain-specific data transformations

### 5. **Services & Dependency Injection**
- **Injectable Services**: `@Injectable({ providedIn: 'root' })`
- **HTTP Client**: RESTful API communication
- **Authentication Service**: JWT token management
- **Event Service**: Event CRUD operations
- **Booking Service**: Ticket booking and management

### 6. **Routing & Navigation**
- **Router Module**: SPA navigation
- **Route Parameters**: Dynamic routing with `:id`
- **Route Guards**: `authGuard`, `organizerGuard` for access control
- **Lazy Loading**: Performance optimization with dynamic imports
- **Child Routes**: Nested routing structure

### 7. **RxJS & Reactive Programming**
- **Observables**: Asynchronous data streams
- **Operators**: `map`, `filter`, `catchError`, `startWith`, `takeUntil`
- **Subscription Management**: Memory leak prevention
- **HTTP Interceptors**: Automatic token attachment

### 8. **Angular Material Integration**
- **UI Components**: Cards, Buttons, Forms, Toolbars, Menus, Icons
- **Theming**: Indigo-Pink theme with custom enhancements
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Built-in ARIA support

### 9. **Bootstrap Grid System**
- **Container/Row/Column**: Responsive layout structure
- **Utility Classes**: Spacing, alignment, display properties
- **Responsive Breakpoints**: Mobile, tablet, desktop support

### 10. **Component Communication**
- **@Input()**: Parent to child data flow
- **@Output()**: Child to parent event emission
- **EventEmitter**: Custom event handling
- **ViewChild**: Direct child component access
- **Services**: Shared state management

### 11. **Lifecycle Hooks**
- **ngOnInit**: Component initialization
- **ngOnDestroy**: Cleanup and unsubscription
- **ngOnChanges**: Input property changes
- **ngAfterViewInit**: View initialization complete

### 12. **State Management**
- **Service-based State**: Centralized data management
- **BehaviorSubject**: Reactive state updates
- **NgRx Ready**: Scalable state management architecture

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizers only)
- `PUT /api/events/:id` - Update event (organizers only)
- `DELETE /api/events/:id` - Cancel event (organizers only)
- `GET /api/events/organizer/my-events` - Get organizer's events

### Bookings
- `POST /api/bookings` - Book tickets
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/event/:eventId/attendees` - Get event attendees

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

## Database Schema

### Users Table
- `id`, `email`, `password`, `name`, `role`, `created_at`

### Events Table
- `id`, `organizer_id`, `name`, `description`, `venue`, `date_time`, `category`, `capacity`, `ticket_price`, `image_url`, `status`, `created_at`

### Bookings Table
- `id`, `event_id`, `attendee_id`, `tickets_booked`, `total_price`, `booking_time`, `qr_code`, `status`

## Key Angular Concepts Demonstrated

1. **Architecture**: Component-based, modular design
2. **Data Binding**: All four types implemented
3. **Forms**: Both reactive and template-driven approaches
4. **Routing**: Advanced routing with guards and lazy loading
5. **Services**: Dependency injection and separation of concerns
6. **RxJS**: Reactive programming patterns
7. **Material Design**: Modern UI/UX implementation
8. **Bootstrap**: Responsive grid system
9. **TypeScript**: Strong typing and modern JavaScript features
10. **Performance**: Lazy loading, OnPush change detection ready

## Next Steps for Enhancement

1. **NgRx Implementation**: Advanced state management
2. **PWA Features**: Service workers, offline support
3. **Testing**: Unit tests with Jasmine/Karma
4. **E2E Testing**: Cypress or Protractor
5. **Internationalization**: i18n support
6. **Performance Optimization**: OnPush change detection
7. **Advanced Animations**: Angular Animations API
8. **Real-time Features**: WebSocket integration

This project demonstrates a comprehensive understanding of Angular 18 concepts and modern web development practices.