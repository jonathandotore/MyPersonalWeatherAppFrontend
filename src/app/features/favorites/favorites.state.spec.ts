import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FavoritesState } from './favorites.state';
import { AuthState } from '../../shared/state/auth';
import { API_BASE_URL } from '../../core/config/api-config';
import type { Favorito } from '../../shared/models/favorito.model';
import type { AuthResponse } from '../../shared/models/auth.model';

function aguardarMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('FavoritesState', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function autenticar(): Promise<void> {
    const auth = TestBed.inject(AuthState);
    const promise = auth.login('maria@teste.com', 'SenhaForte123');
    httpMock
      .expectOne('https://api.test/api/auth/login')
      .flush({ token: 'jwt', expiraEmUtc: '' } satisfies AuthResponse);
    await promise;
  }

  it('mantém a lista vazia enquanto não autenticado', async () => {
    const state = TestBed.inject(FavoritesState);
    await aguardarMicrotasks();

    expect(state.favoritos()).toEqual([]);
    httpMock.expectNone('https://api.test/api/favoritos');
  });

  it('carrega os favoritos do backend assim que autentica', async () => {
    const state = TestBed.inject(FavoritesState);
    await autenticar();
    await aguardarMicrotasks();

    const mock: Favorito[] = [
      {
        id: '1',
        nome: 'Fortaleza',
        paisCodigo: 'BR',
        latitude: -3.7,
        longitude: -38.5,
        dataCriacao: '2026-07-30T00:00:00Z',
      },
    ];
    httpMock.expectOne('https://api.test/api/favoritos').flush(mock);
    await aguardarMicrotasks();

    expect(state.favoritos()).toEqual(mock);
    expect(JSON.parse(localStorage.getItem('weather-app:favoritos-cache')!)).toEqual(mock);
  });

  it('adiciona e remove um favorito', async () => {
    const state = TestBed.inject(FavoritesState);
    await autenticar();
    await aguardarMicrotasks();
    httpMock.expectOne('https://api.test/api/favoritos').flush([]);

    const novo: Favorito = {
      id: '1',
      nome: 'Fortaleza',
      paisCodigo: 'BR',
      latitude: -3.7,
      longitude: -38.5,
      dataCriacao: '2026-07-30T00:00:00Z',
    };

    const addPromise = state.adicionar('Fortaleza', 'BR');
    const addReq = httpMock.expectOne('https://api.test/api/favoritos');
    expect(addReq.request.method).toBe('POST');
    addReq.flush(novo);
    expect(await addPromise).toBe(true);
    expect(state.favoritos()).toEqual([novo]);

    const removePromise = state.remover('1');
    const removeReq = httpMock.expectOne('https://api.test/api/favoritos/1');
    expect(removeReq.request.method).toBe('DELETE');
    removeReq.flush(null);
    expect(await removePromise).toBe(true);
    expect(state.favoritos()).toEqual([]);
  });
});
