import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, map, merge, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { CidadePesquisada, type Coordenadas } from '../../shared/state/cidade-pesquisada';
import type { PrevisaoResposta } from '../../shared/models/previsao.model';

type FonteBusca = { tipo: 'cidade'; cidade: string } | ({ tipo: 'coordenadas' } & Coordenadas);

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
    const cidade$ = toObservable(this.cidadePesquisada.cidadeAtual).pipe(
      map((cidade): FonteBusca => ({ tipo: 'cidade', cidade })),
    );
    const coordenadas$ = toObservable(this.cidadePesquisada.coordenadasAtuais).pipe(
      filter((coordenadas): coordenadas is Coordenadas => !!coordenadas),
      map((coordenadas): FonteBusca => ({ tipo: 'coordenadas', ...coordenadas })),
    );

    merge(cidade$, coordenadas$)
      .pipe(
        switchMap((fonte) => {
          if (fonte.tipo === 'cidade') {
            const cidadeTrim = fonte.cidade.trim();
            if (!cidadeTrim) {
              this.previsaoValue.set(undefined);
              this.previsaoErro.set(undefined);
              this.previsaoCarregando.set(false);
              return of(undefined);
            }

            const url = `${this.baseUrl}${apiEndpoints.previsao(cidadeTrim)}`;
            return this.buscar(url);
          }

          const url = `${this.baseUrl}${apiEndpoints.previsaoPorCoordenadas(fonte.latitude, fonte.longitude)}`;
          return this.buscar(url);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private buscar(url: string) {
    this.previsaoCarregando.set(true);
    this.previsaoErro.set(undefined);

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
  }
}
