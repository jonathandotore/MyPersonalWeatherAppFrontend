import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearch } from './features/weather-search/weather-search';
import { ForecastList } from './features/forecast/forecast-list';
import { AuthStatus } from './features/auth/auth-status';
import { AuthOverlay } from './features/auth/auth-overlay';
import { FavoritesPanel } from './features/favorites/favorites-panel';
import { CidadePesquisada } from './shared/state/cidade-pesquisada';
import { ToastContainer } from './shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    WeatherSearch,
    ForecastList,
    AuthStatus,
    AuthOverlay,
    FavoritesPanel,
    ToastContainer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly busca = inject(CidadePesquisada);

  constructor() {
    this.busca.iniciarComLocalizacaoOuPadrao();
  }
}
