import { Component, inject } from '@angular/core';

import { FavoritesState } from './favorites.state';
import { AuthState } from '../../shared/state/auth';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-favorites-panel',
  imports: [LoadingSpinner],
  templateUrl: './favorites-panel.html',
})
export class FavoritesPanel {
  protected readonly auth = inject(AuthState);
  protected readonly state = inject(FavoritesState);
  private readonly busca = inject(CidadePesquisada);

  protected pesquisar(nome: string): void {
    this.busca.termo.set(nome);
    this.busca.buscarAgora();
  }

  protected remover(id: string): void {
    this.state.remover(id).subscribe();
  }
}
