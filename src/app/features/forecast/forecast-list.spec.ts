import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ForecastList } from './forecast-list';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import { API_BASE_URL } from '../../core/config/api-config';
import type { PrevisaoResposta } from '../../shared/models/previsao.model';

describe('ForecastList', () => {
  let httpMock: HttpTestingController;
  let geolocationOriginal: Geolocation | undefined;

  beforeEach(async () => {
    geolocationOriginal = (navigator as unknown as { geolocation?: Geolocation }).geolocation;

    await TestBed.configureTestingModule({
      imports: [ForecastList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (navigator as unknown as { geolocation?: Geolocation }).geolocation = geolocationOriginal;
  });

  it('não renderiza nada antes de uma cidade ser pesquisada', () => {
    const fixture = TestBed.createComponent(ForecastList);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });

  it('renderiza os 5 dias após a busca', async () => {
    const fixture = TestBed.createComponent(ForecastList);
    fixture.detectChanges();

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.termo.set('Fortaleza');
    cidadePesquisada.buscarAgora();
    fixture.detectChanges();

    const req = httpMock.expectOne('https://api.test/api/clima/Fortaleza/previsao');
    const mock: PrevisaoResposta = {
      cidade: 'Fortaleza',
      paisCodigo: 'BR',
      dias: Array.from({ length: 5 }, (_, i) => ({
        data: `2026-08-0${i + 1}`,
        temperaturaMaxima: 30 + i,
        temperaturaMinima: 24 + i,
        condicao: 'céu limpo',
        icone: '01d',
        iconeUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
        probabilidadeChuva: 0,
      })),
    };
    req.flush(mock);
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-forecast-card');
    expect(cards.length).toBe(5);
  });

  it('busca a previsão diretamente por coordenadas na busca inicial por localização', async () => {
    const fixture = TestBed.createComponent(ForecastList);
    fixture.detectChanges();

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (sucesso) =>
        sucesso({
          coords: { latitude: -25.43, longitude: -49.27 },
        } as GeolocationPosition),
    };
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();
    fixture.detectChanges();

    const req = httpMock.expectOne(
      'https://api.test/api/clima/coordenadas/previsao?latitude=-25.43&longitude=-49.27',
    );
    const mock: PrevisaoResposta = {
      cidade: 'Curitiba',
      paisCodigo: 'BR',
      dias: Array.from({ length: 5 }, (_, i) => ({
        data: `2026-08-0${i + 1}`,
        temperaturaMaxima: 22 + i,
        temperaturaMinima: 12 + i,
        condicao: 'nublado',
        icone: '04d',
        iconeUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
        probabilidadeChuva: 20,
      })),
    };
    req.flush(mock);
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-forecast-card');
    expect(cards.length).toBe(5);
    httpMock.expectNone((r) => r.url.includes('/previsao') && !r.url.includes('coordenadas'));
  });
});
