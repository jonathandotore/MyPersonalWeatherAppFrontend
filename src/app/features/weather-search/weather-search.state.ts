import { Service, inject, signal, effect } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import type { ClimaAtual } from '../../shared/models/clima.model';

@Service()
export class WeatherSearchState {
  private readonly baseUrl = inject(API_BASE_URL);

  /** Valor bruto do campo de busca, atualizado a cada tecla digitada. */
  readonly termo = signal('');

  /** Termo efetivamente pesquisado — só muda por Enter/clique ou após pausa na digitação. */
  private readonly termoBuscado = signal('');

  private readonly termoDebounced = toSignal(
    toObservable(this.termo).pipe(debounceTime(500), distinctUntilChanged()),
    { initialValue: '' },
  );

  readonly clima = httpResource<ClimaAtual>(() => {
    const cidade = this.termoBuscado().trim();
    return cidade ? `${this.baseUrl}${apiEndpoints.climaAtual(cidade)}` : undefined;
  });

  constructor() {
    effect(() => {
      const cidade = this.termoDebounced().trim();
      if (cidade) {
        this.termoBuscado.set(cidade);
      }
    });
  }

  buscarAgora(): void {
    const cidade = this.termo().trim();
    if (cidade) {
      this.termoBuscado.set(cidade);
    }
  }
}
