import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/login']);
export const tenantGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.restored;
  return auth.isTenant() || router.createUrlTree(['/login']);
};
