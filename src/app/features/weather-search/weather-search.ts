import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { WeatherSearchState } from './weather-search.state';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import { AuthState } from '../../shared/state/auth';
import { FavoritesState } from '../favorites/favorites.state';
import { WeatherIcon } from '../../shared/ui/weather-icon/weather-icon';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { extrairMensagemDeErro } from '../../shared/utils/http-error.util';
import type { ClimaAtual } from '../../shared/models/clima.model';

@Component({
  selector: 'app-weather-search',
  imports: [DecimalPipe, WeatherIcon, LoadingSpinner],
  templateUrl: './weather-search.html',
})
export class WeatherSearch {
  protected readonly busca = inject(CidadePesquisada);
  protected readonly climaState = inject(WeatherSearchState);
  protected readonly auth = inject(AuthState);
  protected readonly favoritesState = inject(FavoritesState);

  protected readonly mensagemDeErro = computed(() =>
    extrairMensagemDeErro(this.climaState.clima.error()),
  );

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.busca.termo.set(target.value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.busca.buscarAgora();
  }

  protected toggleFavorito(clima: ClimaAtual): void {
    if (!this.auth.estaAutenticado()) {
      this.auth.abrirPainel();
      return;
    }

    const favorito = this.favoritesState.obterFavorito(clima.cidade);
    if (favorito) {
      this.favoritesState.remover(favorito.id).subscribe();
    } else {
      this.favoritesState.adicionar(clima.cidade, clima.paisCodigo).subscribe();
    }
  }
}
