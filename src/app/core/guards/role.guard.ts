// src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard : CanActivateFn =(route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'];
  const userRole = authService.role;

  if (allowedRoles.includes(userRole || '')) {
    return true;
  }

  // this.router.navigate(['/unauthorized']);
  return false;
};
