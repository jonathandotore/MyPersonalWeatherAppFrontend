import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { FavoritesPanel } from './favorites-panel';
import { AuthState } from '../../shared/state/auth';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import { API_BASE_URL } from '../../core/config/api-config';
import type { Favorito } from '../../shared/models/favorito.model';
import type { AuthResponse } from '../../shared/models/auth.model';

function aguardarMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('FavoritesPanel', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FavoritesPanel],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('não renderiza nada para um visitante não autenticado', () => {
    const fixture = TestBed.createComponent(FavoritesPanel);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });

  it('lista favoritos e permite pesquisar/remover ao clicar', async () => {
    const fixture = TestBed.createComponent(FavoritesPanel);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    const loginPromise = firstValueFrom(auth.login('maria@teste.com', 'SenhaForte123'));
    httpMock
      .expectOne('https://api.test/api/auth/login')
      .flush({ token: 'jwt', expiraEmUtc: '' } satisfies AuthResponse);
    await loginPromise;
    await aguardarMicrotasks();

    const favorito: Favorito = {
      id: '1',
      nome: 'Fortaleza',
      paisCodigo: 'BR',
      latitude: -3.7,
      longitude: -38.5,
      dataCriacao: '2026-07-30T00:00:00Z',
    };
    httpMock.expectOne('https://api.test/api/favoritos').flush([favorito]);
    await aguardarMicrotasks();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Fortaleza');

    const cidadePesquisada = TestBed.inject(CidadePesquisada);
    const pesquisarBtn: HTMLButtonElement = fixture.nativeElement.querySelector('li button');
    pesquisarBtn.click();
    expect(cidadePesquisada.cidadeAtual()).toBe('Fortaleza');

    const removerBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll('li button')[1];
    removerBtn.click();
    httpMock.expectOne('https://api.test/api/favoritos/1').flush(null);
    await aguardarMicrotasks();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma cidade favoritada');
  });
});
