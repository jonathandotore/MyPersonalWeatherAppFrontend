import { Service } from '@angular/core';
import type { Favorito } from '../../shared/models/favorito.model';

const CHAVE_STORAGE = 'weather-app:favoritos-cache';

/**
 * Isola o acesso ao LocalStorage: o resto da aplicação nunca toca `localStorage`
 * diretamente. Guarda só uma CÓPIA local dos favoritos do backend (que é a
 * fonte da verdade, já que /api/favoritos exige JWT) — serve para exibir algo
 * instantaneamente ao recarregar a página, antes da resposta da API chegar.
 */
@Service()
export class FavoritosStorage {
  carregar(): Favorito[] {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      return bruto ? (JSON.parse(bruto) as Favorito[]) : [];
    } catch {
      return [];
    }
  }

  salvar(favoritos: readonly Favorito[]): void {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(favoritos));
    } catch {
      // LocalStorage indisponível (modo privado, quota excedida) — cache é best-effort.
    }
  }

  limpar(): void {
    try {
      localStorage.removeItem(CHAVE_STORAGE);
    } catch {
      // idem
    }
  }
}
