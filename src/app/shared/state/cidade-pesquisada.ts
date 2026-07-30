import { Service, signal, effect } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
}
