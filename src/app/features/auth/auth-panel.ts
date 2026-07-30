import { Component, inject, signal } from '@angular/core';

import { AuthState } from '../../shared/state/auth';

type ModoAuth = 'login' | 'registro';

@Component({
  selector: 'app-auth-panel',
  imports: [],
  templateUrl: './auth-panel.html',
})
export class AuthPanel {
  protected readonly auth = inject(AuthState);

  protected readonly modo = signal<ModoAuth>('login');
  protected readonly nome = signal('');
  protected readonly email = signal('');
  protected readonly senha = signal('');

  protected trocarModo(modo: ModoAuth): void {
    this.modo.set(modo);
    this.auth.erro.set(null);
  }

  protected onNomeInput(event: Event): void {
    this.nome.set((event.target as HTMLInputElement).value);
  }

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onSenhaInput(event: Event): void {
    this.senha.set((event.target as HTMLInputElement).value);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const sucesso =
      this.modo() === 'login'
        ? await this.auth.login(this.email(), this.senha())
        : await this.auth.registrar(this.nome(), this.email(), this.senha());

    if (sucesso) {
      this.nome.set('');
      this.email.set('');
      this.senha.set('');
    }
  }
}
