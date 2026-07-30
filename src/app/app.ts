import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearch } from './features/weather-search/weather-search';
import { ForecastList } from './features/forecast/forecast-list';
import { AuthPanel } from './features/auth/auth-panel';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherSearch, ForecastList, AuthPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
