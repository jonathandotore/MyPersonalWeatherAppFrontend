import { Service, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';

const CIDADE_PADRAO = 'Brasília';

interface RespostaGeocodificacaoReversa {
  city?: string;
  locality?: string;
  countryCode?: string;
}

/**
 * Estado compartilhado da cidade pesquisada — fonte única para as features de
 * clima atual e previsão, que reagem à mesma cidade sem depender uma da outra.
 */
@Service()
export class CidadePesquisada {
  private readonly http = inject(HttpClient);

  /** Valor bruto do campo de busca, atualizado a cada tecla digitada. */
  readonly termo = signal('');

  private readonly cidade = signal('');

  /** Cidade efetivamente pesquisada — só muda por Enter/clique ou após pausa na digitação. */
  readonly cidadeAtual = this.cidade.asReadonly();

  private readonly termoDebounced = toSignal(
    toObservable(this.termo).pipe(debounceTime(500), distinctUntilChanged()),
    { initialValue: '' },
  );

  constructor() {
    effect(() => {
      const cidade = this.termoDebounced().trim();
      if (cidade) {
        this.cidade.set(cidade);
      }
    });
  }

  buscarAgora(): void {
    const cidade = this.termo().trim();
    if (cidade) {
      this.cidade.set(cidade);
    }
  }

  /**
   * Busca inicial ao carregar o app: tenta geolocalizar o dispositivo e
   * resolver a cidade correspondente; se o usuário não aceitar compartilhar
   * a localização (ou algo falhar), cai para uma cidade padrão.
   */
  iniciarComLocalizacaoOuPadrao(): void {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.buscarCidadePadrao();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => this.resolverCidadePorCoordenadas(posicao.coords.latitude, posicao.coords.longitude),
      () => this.buscarCidadePadrao(),
      { timeout: 8000 },
    );
  }

  private buscarCidadePadrao(): void {
    this.termo.set(CIDADE_PADRAO);
    this.buscarAgora();
  }

  private resolverCidadePorCoordenadas(latitude: number, longitude: number): void {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;

    this.http
      .get<RespostaGeocodificacaoReversa>(url)
      .pipe(catchError(() => of(null)))
      .subscribe((resposta) => {
        const cidade = resposta?.city || resposta?.locality;
        if (!cidade) {
          this.buscarCidadePadrao();
          return;
        }

        this.termo.set(resposta?.countryCode ? `${cidade},${resposta.countryCode}` : cidade);
        this.buscarAgora();
      });
  }
}
