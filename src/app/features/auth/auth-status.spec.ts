import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { AuthStatus } from './auth-status';
import { AuthState } from '../../shared/state/auth';
import { API_BASE_URL } from '../../core/config/api-config';
import type { AuthResponse } from '../../shared/models/auth.model';

describe('AuthStatus', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthStatus],
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
    const fixture = TestBed.createComponent(AuthStatus);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });

  it('mostra o e-mail logado e permite sair', async () => {
    const fixture = TestBed.createComponent(AuthStatus);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    const loginPromise = firstValueFrom(auth.login('maria@teste.com', 'SenhaForte123'));
    httpMock
      .expectOne('https://api.test/api/auth/login')
      .flush({ token: 'jwt', expiraEmUtc: '' } satisfies AuthResponse);
    await loginPromise;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('maria@teste.com');

    const sairBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    sairBtn.click();
    fixture.detectChanges();

    expect(auth.estaAutenticado()).toBe(false);
    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });
});
