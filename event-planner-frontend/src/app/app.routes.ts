import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { TicketBookingComponent } from './components/ticket-booking/ticket-booking.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';
import { OrganizerDashboardComponent } from './components/organizer-dashboard/organizer-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'events',
    component: EventListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'events/:id',
    component: EventDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'events/:id/book',
    component: TicketBookingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'booking/:id',
    component: BookingConfirmationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'organizer/dashboard',
    component: OrganizerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'organizer' },
  },
  { path: '**', redirectTo: '/login' },
];
