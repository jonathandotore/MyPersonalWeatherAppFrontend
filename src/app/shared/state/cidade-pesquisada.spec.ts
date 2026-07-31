import { TestBed } from '@angular/core/testing';

import { CidadePesquisada } from './cidade-pesquisada';

describe('CidadePesquisada', () => {
  let geolocationOriginal: Geolocation | undefined;

  beforeEach(() => {
    geolocationOriginal = (navigator as unknown as { geolocation?: Geolocation }).geolocation;
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    (navigator as unknown as { geolocation?: Geolocation }).geolocation = geolocationOriginal;
  });

  it('busca Brasília quando o navegador não suporta geolocalização', () => {
    delete (navigator as unknown as { geolocation?: Geolocation }).geolocation;

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    expect(cidadePesquisada.cidadeAtual()).toBe('Brasília');
    expect(cidadePesquisada.coordenadasAtuais()).toBeUndefined();
  });

  it('busca Brasília quando o usuário não aceita compartilhar a localização', () => {
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (_sucesso, erro) => erro?.({} as GeolocationPositionError),
    };

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    expect(cidadePesquisada.cidadeAtual()).toBe('Brasília');
    expect(cidadePesquisada.coordenadasAtuais()).toBeUndefined();
  });

  it('expõe a latitude/longitude direto quando a localização é aceita, sem geocodificar', () => {
    (navigator as unknown as { geolocation: Partial<Geolocation> }).geolocation = {
      getCurrentPosition: (sucesso) =>
        sucesso({
          coords: { latitude: -25.43, longitude: -49.27 },
        } as GeolocationPosition),
    };

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    cidadePesquisada.iniciarComLocalizacaoOuPadrao();

    expect(cidadePesquisada.coordenadasAtuais()).toEqual({ latitude: -25.43, longitude: -49.27 });
    expect(cidadePesquisada.cidadeAtual()).toBe('');
  });
});
