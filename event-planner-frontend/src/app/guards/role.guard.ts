import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const user = authService.getCurrentUser();

  if (user && user.role === expectedRole) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
