import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthOverlay } from './auth-overlay';
import { AuthState } from '../../shared/state/auth';
import { API_BASE_URL } from '../../core/config/api-config';
import type { AuthResponse } from '../../shared/models/auth.model';

describe('AuthOverlay', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthOverlay],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fica oculto por padrão', () => {
    const fixture = TestBed.createComponent(AuthOverlay);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string).trim()).toBe('');
  });

  it('aparece quando o painel é aberto e contém o formulário de login', () => {
    const fixture = TestBed.createComponent(AuthOverlay);
    fixture.detectChanges();

    TestBed.inject(AuthState).abrirPainel();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="email"]')).toBeTruthy();
  });

  it('fecha ao clicar no botão de fechar, sem autenticar', () => {
    const fixture = TestBed.createComponent(AuthOverlay);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    auth.abrirPainel();
    fixture.detectChanges();

    const fecharBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Fechar e continuar sem favoritar"]',
    );
    fecharBtn.click();
    fixture.detectChanges();

    expect(auth.painelAberto()).toBe(false);
    expect(auth.estaAutenticado()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('fecha automaticamente após um login bem-sucedido', async () => {
    const fixture = TestBed.createComponent(AuthOverlay);
    fixture.detectChanges();

    const auth = TestBed.inject(AuthState);
    auth.abrirPainel();
    fixture.detectChanges();

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
    const senhaInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="password"]');
    emailInput.value = 'maria@teste.com';
    emailInput.dispatchEvent(new Event('input'));
    senhaInput.value = 'SenhaForte123';
    senhaInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    const req = httpMock.expectOne('https://api.test/api/auth/login');
    const mock: AuthResponse = { token: 'fake-jwt', expiraEmUtc: '2026-07-30T17:00:00Z' };
    req.flush(mock);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(auth.painelAberto()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeFalsy();
  });
});
