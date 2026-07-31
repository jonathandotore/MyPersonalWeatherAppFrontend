import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthPanel } from './auth-panel';
import { AuthState } from '../../shared/state/auth';
import { API_BASE_URL } from '../../core/config/api-config';
import type { AuthResponse } from '../../shared/models/auth.model';

describe('AuthPanel', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPanel],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('mostra o formulário de login por padrão', () => {
    const fixture = TestBed.createComponent(AuthPanel);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[type="email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="text"]')).toBeFalsy();
  });

  it('faz login e limpa o formulário', async () => {
    const fixture = TestBed.createComponent(AuthPanel);
    fixture.detectChanges();

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
    const senhaInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="password"]');
    emailInput.value = 'maria@teste.com';
    emailInput.dispatchEvent(new Event('input'));
    senhaInput.value = 'SenhaForte123';
    senhaInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    const req = httpMock.expectOne('https://api.test/api/auth/login');
    expect(req.request.body).toEqual({ email: 'maria@teste.com', senha: 'SenhaForte123' });
    const mock: AuthResponse = { token: 'fake-jwt', expiraEmUtc: '2026-07-30T17:00:00Z' };
    req.flush(mock);

    await fixture.whenStable();
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    expect(auth.estaAutenticado()).toBe(true);
    expect(auth.emailLogado()).toBe('maria@teste.com');
    expect(
      (fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement).value,
    ).toBe('');
  });
});
