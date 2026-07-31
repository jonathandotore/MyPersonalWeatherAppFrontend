import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { AuthState } from './shared/state/auth';
import { CidadePesquisada } from './shared/state/cidade-pesquisada';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Minha Previsão do Tempo');
  });

  it('não mostra o painel de login na rota inicial', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-auth-panel')).toBeFalsy();
  });

  it('mostra o painel de login quando algo pede autenticação', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    TestBed.inject(AuthState).abrirPainel();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-auth-panel')).toBeTruthy();
  });

  it('busca a cidade padrão ao iniciar quando não há geolocalização (ambiente de teste)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(TestBed.inject(CidadePesquisada).cidadeAtual()).toBe('Brasília');

    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne((r) => r.url.endsWith('/clima/Bras%C3%ADlia')).flush({});
    httpMock.expectOne((r) => r.url.endsWith('/clima/Bras%C3%ADlia/previsao')).flush({});
  });
});
