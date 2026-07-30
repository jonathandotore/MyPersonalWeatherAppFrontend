import { Component, computed, inject } from '@angular/core';

import { ForecastState } from './forecast.state';
import { ForecastCard } from '../../shared/ui/forecast-card/forecast-card';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { extrairMensagemDeErro } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-forecast-list',
  imports: [ForecastCard, LoadingSpinner],
  templateUrl: './forecast-list.html',
})
export class ForecastList {
  protected readonly state = inject(ForecastState);

  protected readonly mensagemDeErro = computed(() =>
    extrairMensagemDeErro(this.state.previsao.error()),
  );
}
