import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WeatherSearch } from './weather-search';
import { AuthState } from '../../shared/state/auth';
import { NotificationsState } from '../../shared/state/notifications';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import { API_BASE_URL } from '../../core/config/api-config';
import type { ClimaAtual } from '../../shared/models/clima.model';

describe('WeatherSearch', () => {
  let httpMock: HttpTestingController;
  let geolocationOriginal: Geolocation | undefined;

  beforeEach(async () => {
    geolocationOriginal = (navigator as unknown as { geolocation?: Geolocation }).geolocation;

    await TestBed.configureTestingModule({
      imports: [WeatherSearch],
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

  function buscar(fixture: ReturnType<typeof TestBed.createComponent>, cidade: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = cidade;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('mostra o estado vazio antes de qualquer busca', () => {
    const fixture = TestBed.createComponent(WeatherSearch);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Busque uma cidade');
  });

  it('renderiza o clima atual após uma busca bem-sucedida', async () => {
    const fixture = TestBed.createComponent(WeatherSearch);
    fixture.detectChanges();

    buscar(fixture, 'Curitiba');

    const req = httpMock.expectOne('https://api.test/api/clima/Curitiba');
    const climaMock: ClimaAtual = {
      cidade: 'Curitiba',
      paisCodigo: 'BR',
      temperatura: 21.6,
      sensacaoTermica: 21.6,
      temperaturaMaxima: 21.64,
      temperaturaMinima: 11.02,
      umidade: 55,
      condicao: 'nublado',
      icone: '04d',
      iconeUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
      latitude: -25.43,
      longitude: -49.27,
      dataHoraLocal: '2026-07-30T09:45:55-03:00',
      fonteMaxMin: 'previsao',
    };
    req.flush(climaMock);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Curitiba, BR');
    expect(text).toContain('nublado');
    expect(text).toContain('55%');
  });

  it('mostra uma mensagem amigável quando a cidade não é encontrada', async () => {
    const fixture = TestBed.createComponent(WeatherSearch);
    fixture.detectChanges();

    buscar(fixture, 'cidadeinexistente123');

    const req = httpMock.expectOne('https://api.test/api/clima/cidadeinexistente123');
    req.flush(
      {
        title: 'Cidade não encontrada',
        status: 404,
        detail: "Não foi encontrada nenhuma cidade com o nome 'cidadeinexistente123'.",
      },
      { status: 404, statusText: 'Not Found' },
    );

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Não foi encontrada nenhuma cidade');

    const notificacoes = TestBed.inject(NotificationsState).notificacoes();
    expect(notificacoes.length).toBe(1);
    expect(notificacoes[0].mensagem).toContain('Não foi encontrada nenhuma cidade');
  });

  it('clicar no coração sem estar autenticado abre o painel de login em vez de favoritar', async () => {
    const fixture = TestBed.createComponent(WeatherSearch);
    fixture.detectChanges();

    buscar(fixture, 'Curitiba');
    const req = httpMock.expectOne('https://api.test/api/clima/Curitiba');
    const climaMock: ClimaAtual = {
      cidade: 'Curitiba',
      paisCodigo: 'BR',
      temperatura: 21.6,
      sensacaoTermica: 21.6,
      temperaturaMaxima: 21.64,
      temperaturaMinima: 11.02,
      umidade: 55,
      condicao: 'nublado',
      icone: '04d',
      iconeUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
      latitude: -25.43,
      longitude: -49.27,
      dataHoraLocal: '2026-07-30T09:45:55-03:00',
      fonteMaxMin: 'previsao',
    };
    req.flush(climaMock);
    await fixture.whenStable();
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    expect(auth.painelAberto()).toBe(false);

    const coracaoBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label^="Adicionar"]',
    );
    coracaoBtn.click();

    expect(auth.painelAberto()).toBe(true);
    httpMock.expectNone('https://api.test/api/favoritos');
  });

  it('busca inicial por coordenadas resolve o clima direto, sem busca por nome', async () => {
    const fixture = TestBed.createComponent(WeatherSearch);
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
      'https://api.test/api/clima/coordenadas?latitude=-25.43&longitude=-49.27',
    );
    const climaMock: ClimaAtual = {
      cidade: 'Curitiba',
      paisCodigo: 'BR',
      temperatura: 21.6,
      sensacaoTermica: 21.6,
      temperaturaMaxima: 21.64,
      temperaturaMinima: 11.02,
      umidade: 55,
      condicao: 'nublado',
      icone: '04d',
      iconeUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
      latitude: -25.43,
      longitude: -49.27,
      dataHoraLocal: '2026-07-30T09:45:55-03:00',
      fonteMaxMin: 'previsao',
    };
    req.flush(climaMock);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Curitiba, BR');
    expect(cidadePesquisada.cidadeAtual()).toBe('');

    httpMock.expectNone((r) => r.url.startsWith('https://api.test/api/clima/') && !r.url.includes('coordenadas'));
  });
});
