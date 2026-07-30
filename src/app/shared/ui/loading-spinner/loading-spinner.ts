import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center gap-2 py-6 text-slate-500" role="status">
      <span
        class="h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"
      ></span>
      <span class="text-sm">{{ label() }}</span>
    </div>
  `,
})
export class LoadingSpinner {
  readonly label = input('Carregando...');
}
