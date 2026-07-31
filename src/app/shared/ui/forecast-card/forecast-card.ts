import { Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { WeatherIcon } from '../weather-icon/weather-icon';
import { parseDataLocal } from '../../utils/data-local.util';
import type { PrevisaoDiaria } from '../../models/previsao.model';

@Component({
  selector: 'app-forecast-card',
  imports: [DatePipe, DecimalPipe, WeatherIcon],
  template: `
    <div class="flex flex-col items-center gap-2 rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
      <span class="text-base font-medium text-slate-600 capitalize">{{ data() | date: 'EEE, dd/MM' }}</span>
      <app-weather-icon [url]="dia().iconeUrl" [alt]="dia().condicao" [size]="64" />
      <span class="text-sm text-slate-500 capitalize">{{ dia().condicao }}</span>
      <div class="flex items-baseline gap-2 text-lg">
        <span class="font-semibold text-slate-900">{{ dia().temperaturaMaxima | number: '1.0-1' }}°</span>
        <span class="text-slate-400">{{ dia().temperaturaMinima | number: '1.0-1' }}°</span>
      </div>
    </div>
  `,
})
export class ForecastCard {
  readonly dia = input.required<PrevisaoDiaria>();

  protected readonly data = computed(() => parseDataLocal(this.dia().data));
}
