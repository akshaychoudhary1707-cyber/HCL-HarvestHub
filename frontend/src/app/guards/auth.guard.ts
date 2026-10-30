import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route Guard: Protects private routes (Dashboard, Farms, Crop Plans, Crops, Crop Requirements).
 * If the user is not authenticated, redirects them to /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page and preserve target url for post-login redirect
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

