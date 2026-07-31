import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, map, merge, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { CidadePesquisada, type Coordenadas } from '../../shared/state/cidade-pesquisada';
import { NotificationsState } from '../../shared/state/notifications';
import { extrairMensagemDeErro } from '../../shared/utils/http-error.util';
import type { ClimaAtual } from '../../shared/models/clima.model';

type FonteBusca = { tipo: 'cidade'; cidade: string } | ({ tipo: 'coordenadas' } & Coordenadas);

@Service()
export class WeatherSearchState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly cidadePesquisada = inject(CidadePesquisada);
  private readonly notifications = inject(NotificationsState);

  private readonly climaValue = signal<ClimaAtual | undefined>(undefined);
  private readonly climaCarregando = signal(false);
  private readonly climaErro = signal<unknown>(undefined);

  readonly clima = {
    value: this.climaValue.asReadonly(),
    isLoading: this.climaCarregando.asReadonly(),
    error: this.climaErro.asReadonly(),
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
              this.climaValue.set(undefined);
              this.climaErro.set(undefined);
              this.climaCarregando.set(false);
              return of(undefined);
            }

            const url = `${this.baseUrl}${apiEndpoints.climaAtual(cidadeTrim)}`;
            return this.buscar(url);
          }

          const url = `${this.baseUrl}${apiEndpoints.climaAtualPorCoordenadas(fonte.latitude, fonte.longitude)}`;
          return this.buscar(url);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private buscar(url: string) {
    this.climaCarregando.set(true);
    this.climaErro.set(undefined);

    return this.http.get<ClimaAtual>(url).pipe(
      tap((clima) => {
        this.climaValue.set(clima);
        this.climaCarregando.set(false);
      }),
      catchError((erro: HttpErrorResponse) => {
        this.climaValue.set(undefined);
        this.climaErro.set(erro);
        this.climaCarregando.set(false);
        this.notifications.notificarErro(extrairMensagemDeErro(erro));
        return of(undefined);
      }),
    );
  }
}
