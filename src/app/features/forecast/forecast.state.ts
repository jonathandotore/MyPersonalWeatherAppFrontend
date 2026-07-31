import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import type { PrevisaoResposta } from '../../shared/models/previsao.model';

@Service()
export class ForecastState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly cidadePesquisada = inject(CidadePesquisada);

  private readonly previsaoValue = signal<PrevisaoResposta | undefined>(undefined);
  private readonly previsaoCarregando = signal(false);
  private readonly previsaoErro = signal<unknown>(undefined);

  readonly previsao = {
    value: this.previsaoValue.asReadonly(),
    isLoading: this.previsaoCarregando.asReadonly(),
    error: this.previsaoErro.asReadonly(),
  };

  constructor() {
    toObservable(this.cidadePesquisada.cidadeAtual)
      .pipe(
        switchMap((cidade) => {
          const cidadeTrim = cidade.trim();
          if (!cidadeTrim) {
            this.previsaoValue.set(undefined);
            this.previsaoErro.set(undefined);
            this.previsaoCarregando.set(false);
            return of(undefined);
          }

          this.previsaoCarregando.set(true);
          this.previsaoErro.set(undefined);

          const url = `${this.baseUrl}${apiEndpoints.previsao(cidadeTrim)}`;
          return this.http.get<PrevisaoResposta>(url).pipe(
            tap((previsao) => {
              this.previsaoValue.set(previsao);
              this.previsaoCarregando.set(false);
            }),
            catchError((erro: HttpErrorResponse) => {
              this.previsaoValue.set(undefined);
              this.previsaoErro.set(erro);
              this.previsaoCarregando.set(false);
              return of(undefined);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
