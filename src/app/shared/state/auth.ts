import { Service, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

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

  /** Painel de login/registro fica oculto até algo pedir autenticação (ex.: favoritar uma cidade). */
  private readonly _painelAberto = signal(false);
  readonly painelAberto = this._painelAberto.asReadonly();

  constructor() {
    effect(() => {
      if (this.estaAutenticado()) {
        this._painelAberto.set(false);
      }
    });
  }

  obterToken(): string | null {
    return this.token();
  }

  abrirPainel(): void {
    this._painelAberto.set(true);
  }

  fecharPainel(): void {
    this._painelAberto.set(false);
  }

  login(email: string, senha: string): Observable<boolean> {
    return this.autenticar(`${this.baseUrl}${apiEndpoints.login}`, { email, senha }, email);
  }

  registrar(nome: string, email: string, senha: string): Observable<boolean> {
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

  private autenticar(url: string, body: unknown, email: string): Observable<boolean> {
    this.carregando.set(true);
    this.erro.set(null);
    return this.http.post<AuthResponse>(url, body).pipe(
      tap((resposta) => {
        this.token.set(resposta.token);
        this.email.set(email);
        this.carregando.set(false);
      }),
      map(() => true),
      catchError((erro: HttpErrorResponse) => {
        this.erro.set(extrairMensagemDeErro(erro));
        this.carregando.set(false);
        return of(false);
      }),
    );
  }
}
