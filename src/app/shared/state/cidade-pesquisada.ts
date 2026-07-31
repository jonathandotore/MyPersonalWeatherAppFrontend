import { Service, signal, effect } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

const CIDADE_PADRAO = 'Brasília';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/**
 * Estado compartilhado da cidade pesquisada — fonte única para as features de
 * clima atual e previsão, que reagem à mesma cidade sem depender uma da outra.
 */
@Service()
export class CidadePesquisada {
  /** Valor bruto do campo de busca, atualizado a cada tecla digitada. */
  readonly termo = signal('');

  private readonly cidade = signal('');

  /** Cidade efetivamente pesquisada — só muda por Enter/clique ou após pausa na digitação. */
  readonly cidadeAtual = this.cidade.asReadonly();

  /** Coordenadas da localização do dispositivo — busca inicial única, direto por lat/lon. */
  private readonly coordenadas = signal<Coordenadas | undefined>(undefined);
  readonly coordenadasAtuais = this.coordenadas.asReadonly();

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
   * Busca inicial ao carregar o app: tenta geolocalizar o dispositivo e busca o
   * clima diretamente por latitude/longitude; se o usuário não aceitar
   * compartilhar a localização (ou algo falhar), cai para uma cidade padrão.
   */
  iniciarComLocalizacaoOuPadrao(): void {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.buscarCidadePadrao();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) =>
        this.coordenadas.set({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        }),
      () => this.buscarCidadePadrao(),
      { timeout: 8000 },
    );
  }

  private buscarCidadePadrao(): void {
    this.termo.set(CIDADE_PADRAO);
    this.buscarAgora();
  }
}
