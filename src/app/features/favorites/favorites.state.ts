import { Service, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { AuthState } from '../../shared/state/auth';
import { extrairMensagemDeErro } from '../../shared/utils/http-error.util';
import { FavoritosStorage } from './favoritos-storage';
import type { Favorito } from '../../shared/models/favorito.model';

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase();
}

@Service()
export class FavoritesState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly auth = inject(AuthState);
  private readonly storage = inject(FavoritosStorage);

  private readonly _favoritos = signal<Favorito[]>(this.storage.carregar());
  readonly favoritos = this._favoritos.asReadonly();

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.auth.estaAutenticado()) {
        this.recarregar().subscribe();
      } else {
        this._favoritos.set([]);
        this.storage.limpar();
      }
    });
  }

  obterFavorito(nomeCidade: string): Favorito | undefined {
    const alvo = normalizarNome(nomeCidade);
    return this._favoritos().find((favorito) => normalizarNome(favorito.nome) === alvo);
  }

  recarregar(): Observable<Favorito[]> {
    this.carregando.set(true);
    this.erro.set(null);
    return this.http.get<Favorito[]>(`${this.baseUrl}${apiEndpoints.favoritos}`).pipe(
      tap((favoritos) => {
        this._favoritos.set(favoritos);
        this.storage.salvar(favoritos);
        this.carregando.set(false);
      }),
      catchError((erro: HttpErrorResponse) => {
        this.erro.set(extrairMensagemDeErro(erro));
        this.carregando.set(false);
        return of<Favorito[]>([]);
      }),
    );
  }

  adicionar(nome: string, paisCodigo?: string): Observable<boolean> {
    this.erro.set(null);
    return this.http
      .post<Favorito>(`${this.baseUrl}${apiEndpoints.favoritos}`, { nome, paisCodigo })
      .pipe(
        tap((novoFavorito) => {
          this._favoritos.update((lista) => [...lista, novoFavorito]);
          this.storage.salvar(this._favoritos());
        }),
        map(() => true),
        catchError((erro: HttpErrorResponse) => {
          this.erro.set(extrairMensagemDeErro(erro));
          return of(false);
        }),
      );
  }

  remover(id: string): Observable<boolean> {
    this.erro.set(null);
    return this.http.delete<void>(`${this.baseUrl}${apiEndpoints.favorito(id)}`).pipe(
      tap(() => {
        this._favoritos.update((lista) => lista.filter((favorito) => favorito.id !== id));
        this.storage.salvar(this._favoritos());
      }),
      map(() => true),
      catchError((erro: HttpErrorResponse) => {
        this.erro.set(extrairMensagemDeErro(erro));
        return of(false);
      }),
    );
  }
}
