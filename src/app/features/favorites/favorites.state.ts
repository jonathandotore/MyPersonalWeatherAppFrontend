import { Service, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
        this.recarregar();
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

  async recarregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const favoritos = await firstValueFrom(
        this.http.get<Favorito[]>(`${this.baseUrl}${apiEndpoints.favoritos}`),
      );
      this._favoritos.set(favoritos);
      this.storage.salvar(favoritos);
    } catch (erro) {
      this.erro.set(extrairMensagemDeErro(erro));
    } finally {
      this.carregando.set(false);
    }
  }

  async adicionar(nome: string, paisCodigo?: string): Promise<boolean> {
    this.erro.set(null);
    try {
      const novoFavorito = await firstValueFrom(
        this.http.post<Favorito>(`${this.baseUrl}${apiEndpoints.favoritos}`, { nome, paisCodigo }),
      );
      this._favoritos.update((lista) => [...lista, novoFavorito]);
      this.storage.salvar(this._favoritos());
      return true;
    } catch (erro) {
      this.erro.set(extrairMensagemDeErro(erro));
      return false;
    }
  }

  async remover(id: string): Promise<boolean> {
    this.erro.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}${apiEndpoints.favorito(id)}`));
      this._favoritos.update((lista) => lista.filter((favorito) => favorito.id !== id));
      this.storage.salvar(this._favoritos());
      return true;
    } catch (erro) {
      this.erro.set(extrairMensagemDeErro(erro));
      return false;
    }
  }
}
