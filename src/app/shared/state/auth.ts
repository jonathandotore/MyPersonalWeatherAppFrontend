import { Service, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { extrairMensagemDeErro } from '../utils/http-error.util';
import type { AuthResponse } from '../models/auth.model';

/**
 * Token mantido só em memória (nunca em LocalStorage) para reduzir a
 * superfície de um eventual XSS — recarregar a página exige novo login.
 */
@Service()
export class AuthState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly token = signal<string | null>(null);
  private readonly email = signal<string | null>(null);

  readonly estaAutenticado = computed(() => this.token() !== null);
  readonly emailLogado = this.email.asReadonly();

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  obterToken(): string | null {
    return this.token();
  }

  async login(email: string, senha: string): Promise<boolean> {
    return this.autenticar(`${this.baseUrl}${apiEndpoints.login}`, { email, senha }, email);
  }

  async registrar(nome: string, email: string, senha: string): Promise<boolean> {
    return this.autenticar(
      `${this.baseUrl}${apiEndpoints.registro}`,
      { nome, email, senha },
      email,
    );
  }

  logout(): void {
    this.token.set(null);
    this.email.set(null);
  }

  private async autenticar(url: string, body: unknown, email: string): Promise<boolean> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const resposta = await firstValueFrom(this.http.post<AuthResponse>(url, body));
      this.token.set(resposta.token);
      this.email.set(email);
      return true;
    } catch (erro) {
      this.erro.set(extrairMensagemDeErro(erro));
      return false;
    } finally {
      this.carregando.set(false);
    }
  }
}
