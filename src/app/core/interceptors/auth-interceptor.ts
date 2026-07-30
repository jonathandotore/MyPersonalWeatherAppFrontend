import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';

import { AuthState } from '../../shared/state/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthState).obterToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
