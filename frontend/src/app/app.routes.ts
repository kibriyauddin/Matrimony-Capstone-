import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { EventListComponent } from './events/event-list/event-list.component';
import { EventAttendeesComponent } from './organizer/event-attendees/event-attendees.component';
import { authGuard, organizerGuard, attendeeGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, canActivate: [authGuard] },
      { path: 'events', component: EventListComponent },
      { 
        path: 'events/:id', 
        loadComponent: () => import('./events/event-details/event-details.component').then(m => m.EventDetailsComponent)
      },
      { 
        path: 'bookings', 
        canActivate: [attendeeGuard],
        loadComponent: () => import('./bookings/booking-list/booking-list.component').then(m => m.BookingListComponent)
      },
      { 
        path: 'booking/:id', 
        canActivate: [attendeeGuard],
        loadComponent: () => import('./bookings/booking-details/booking-details.component').then(m => m.BookingDetailsComponent)
      },
      { 
        path: 'profile', 
        canActivate: [authGuard],
        loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'organizer',
        canActivate: [organizerGuard],
        children: [
          { 
            path: 'dashboard', 
            loadComponent: () => import('./organizer/dashboard/dashboard.component').then(m => m.DashboardComponent)
          },
          { 
            path: 'create-event', 
            loadComponent: () => import('./organizer/create-event/create-event.component').then(m => m.CreateEventComponent)
          },
          { 
            path: 'edit-event/:id', 
            loadComponent: () => import('./organizer/edit-event/edit-event.component').then(m => m.EditEventComponent)
          },
          { 
            path: 'event/:id/attendees', 
            component: EventAttendeesComponent
          },
          { 
            path: 'email-test', 
            loadComponent: () => import('./organizer/email-test/email-test.component').then(m => m.EmailTestComponent)
          }
        ]
      }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
