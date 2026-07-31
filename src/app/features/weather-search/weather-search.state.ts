import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import type { ClimaAtual } from '../../shared/models/clima.model';

@Service()
export class WeatherSearchState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly cidadePesquisada = inject(CidadePesquisada);

  private readonly climaValue = signal<ClimaAtual | undefined>(undefined);
  private readonly climaCarregando = signal(false);
  private readonly climaErro = signal<unknown>(undefined);

  readonly clima = {
    value: this.climaValue.asReadonly(),
    isLoading: this.climaCarregando.asReadonly(),
    error: this.climaErro.asReadonly(),
  };

  constructor() {
    toObservable(this.cidadePesquisada.cidadeAtual)
      .pipe(
        switchMap((cidade) => {
          const cidadeTrim = cidade.trim();
          if (!cidadeTrim) {
            this.climaValue.set(undefined);
            this.climaErro.set(undefined);
            this.climaCarregando.set(false);
            return of(undefined);
          }

          this.climaCarregando.set(true);
          this.climaErro.set(undefined);

          const url = `${this.baseUrl}${apiEndpoints.climaAtual(cidadeTrim)}`;
          return this.http.get<ClimaAtual>(url).pipe(
            tap((clima) => {
              this.climaValue.set(clima);
              this.climaCarregando.set(false);
            }),
            catchError((erro: HttpErrorResponse) => {
              this.climaValue.set(undefined);
              this.climaErro.set(erro);
              this.climaCarregando.set(false);
              return of(undefined);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
