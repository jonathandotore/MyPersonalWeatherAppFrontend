import { Component, input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  template: `<img [src]="url()" [alt]="alt()" [width]="size()" [height]="size()" />`,
})
export class WeatherIcon {
  readonly url = input.required<string>();
  readonly alt = input<string>('Ícone da condição do tempo');
  readonly size = input<number>(64);
}
