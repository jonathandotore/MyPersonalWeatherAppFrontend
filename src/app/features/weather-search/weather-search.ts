import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { WeatherSearchState } from './weather-search.state';
import { WeatherIcon } from '../../shared/ui/weather-icon/weather-icon';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { extrairMensagemDeErro } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-weather-search',
  imports: [DecimalPipe, WeatherIcon, LoadingSpinner],
  templateUrl: './weather-search.html',
})
export class WeatherSearch {
  protected readonly state = inject(WeatherSearchState);

  protected readonly mensagemDeErro = computed(() =>
    extrairMensagemDeErro(this.state.clima.error()),
  );

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.state.termo.set(target.value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.state.buscarAgora();
  }
}
