import { Component, inject } from '@angular/core';

import { AuthState } from '../../shared/state/auth';
import { AuthPanel } from './auth-panel';

@Component({
  selector: 'app-auth-overlay',
  imports: [AuthPanel],
  templateUrl: './auth-overlay.html',
})
export class AuthOverlay {
  protected readonly auth = inject(AuthState);

  protected fechar(): void {
    this.auth.fecharPainel();
  }
}
