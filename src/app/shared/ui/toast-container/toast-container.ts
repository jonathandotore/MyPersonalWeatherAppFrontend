import { Component, inject } from '@angular/core';

import { NotificationsState } from '../../state/notifications';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    <div class="fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      @for (notificacao of state.notificacoes(); track notificacao.id) {
        <div
          class="flex items-start gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg"
          role="alert"
        >
          <span class="flex-1">{{ notificacao.mensagem }}</span>
          <button
            type="button"
            class="shrink-0 text-white/80 hover:text-white"
            aria-label="Fechar notificação"
            (click)="state.remover(notificacao.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly state = inject(NotificationsState);
}
