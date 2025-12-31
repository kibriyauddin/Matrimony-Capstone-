import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const attendeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('attendee')) {
    return true;
  }

  // If user is organizer, redirect to organizer dashboard
  if (authService.canAccessOrganizer()) {
    router.navigate(['/organizer/dashboard']);
  } else {
    router.navigate(['/events']);
  }
  return false;
};

export const organizerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.canAccessOrganizer()) {
    return true;
  }

  router.navigate(['/events']);
  return false;
};