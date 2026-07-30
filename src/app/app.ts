import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearch } from './features/weather-search/weather-search';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherSearch],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
