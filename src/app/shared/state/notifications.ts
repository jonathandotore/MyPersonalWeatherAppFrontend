import { Service, signal } from '@angular/core';

export interface Notificacao {
  id: number;
  mensagem: string;
}

const DURACAO_MS = 6000;

@Service()
export class NotificationsState {
  private proximoId = 0;

  private readonly _notificacoes = signal<Notificacao[]>([]);
  readonly notificacoes = this._notificacoes.asReadonly();

  notificarErro(mensagem: string): void {
    const notificacao: Notificacao = { id: this.proximoId++, mensagem };
    this._notificacoes.update((lista) => [...lista, notificacao]);
    setTimeout(() => this.remover(notificacao.id), DURACAO_MS);
  }

  remover(id: number): void {
    this._notificacoes.update((lista) => lista.filter((notificacao) => notificacao.id !== id));
  }
}
