import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CidadePesquisada } from './cidade-pesquisada';

describe('CidadePesquisada', () => {
  let httpMock: HttpTestingController;
  let geolocationOriginal: Geolocation | undefined;

  beforeEach(() => {
    geolocationOriginal = (navigator as unknown as { geolocation?: Geolocation }).geolocation;

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (navigator as unknown as { geolocation?: Geolocation }).geolocation = geolocationOriginal;
  });

  it('busca Brasília quando o navegador não suporta geolocalização', () => {
    delete (navigator as unknown as { geolocation?: Geolocation }).geolocation;

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    expect(cidadePesquisada.cidadeAtual()).toBe('Brasília');
  });

  it('busca Brasília quando o usuário não aceita compartilhar a localização', () => {
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (_sucesso, erro) => erro?.({} as GeolocationPositionError),
    };

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    expect(cidadePesquisada.cidadeAtual()).toBe('Brasília');
  });

  it('busca a cidade resolvida a partir das coordenadas quando a localização é aceita', () => {
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (sucesso) =>
        sucesso({
          coords: { latitude: -25.43, longitude: -49.27 },
        } as GeolocationPosition),
    };

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    const req = httpMock.expectOne((r) => r.url.includes('bigdatacloud.net'));
    req.flush({ city: 'Curitiba', countryCode: 'BR' });

    expect(cidadePesquisada.cidadeAtual()).toBe('Curitiba,BR');
  });

  it('busca Brasília quando a geocodificação reversa falha', () => {
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (sucesso) =>
        sucesso({
          coords: { latitude: -25.43, longitude: -49.27 },
        } as GeolocationPosition),
    };

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    const req = httpMock.expectOne((r) => r.url.includes('bigdatacloud.net'));
    req.flush('erro', { status: 500, statusText: 'Server Error' });

    expect(cidadePesquisada.cidadeAtual()).toBe('Brasília');
  });
});
