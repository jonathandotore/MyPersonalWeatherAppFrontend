import { Component, inject } from '@angular/core';

import { AuthState } from '../../shared/state/auth';

@Component({
  selector: 'app-auth-status',
  imports: [],
  template: `
    @if (auth.estaAutenticado()) {
      <div class="mb-6 flex items-center justify-end gap-2 text-sm text-slate-600">
        <span class="min-w-0 truncate">
          Logado como <strong class="text-slate-900">{{ auth.emailLogado() }}</strong>
        </span>
        <button
          type="button"
          class="shrink-0 font-medium text-sky-600 hover:underline"
          (click)="auth.logout()"
        >
          Sair
        </button>
      </div>
    }
  `,
})
export class AuthStatus {
  protected readonly auth = inject(AuthState);
}
