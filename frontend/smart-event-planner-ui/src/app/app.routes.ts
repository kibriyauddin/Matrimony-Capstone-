import { Routes } from '@angular/router';
import { OrganizerDashboardComponent } from './features/organizer/organizer-dashboard/organizer-dashboard';
import { EventAttendeesComponent } from './features/organizer/event-attendees/event-attendees';
import { EventCreateComponent } from './features/organizer/event-create/event-create';

export const routes: Routes = [
  { path: '', redirectTo: 'organizer/dashboard', pathMatch: 'full' },
  {
    path: 'organizer/create',
    component: EventCreateComponent
  },

  { path: 'organizer/dashboard', component: OrganizerDashboardComponent },
  { path: 'organizer/events/:id/attendees', component: EventAttendeesComponent },

  // fallback (important)
  { path: '**', redirectTo: 'organiazer/dashboard' }
];
