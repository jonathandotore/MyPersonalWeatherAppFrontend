import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherSearch } from './features/weather-search/weather-search';
import { ForecastList } from './features/forecast/forecast-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherSearch, ForecastList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
