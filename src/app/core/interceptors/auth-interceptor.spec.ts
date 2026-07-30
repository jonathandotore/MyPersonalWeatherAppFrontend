import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth-interceptor';
import { AuthState } from '../../shared/state/auth';
import { API_BASE_URL } from '../config/api-config';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.test/api' },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('não anexa Authorization quando não há token', () => {
    http.get('/ping').subscribe();

    const req = httpMock.expectOne('/ping');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('anexa Bearer <token> quando o usuário está autenticado', () => {
    const authState = TestBed.inject(AuthState);
    (authState as unknown as { obterToken: () => string | null }).obterToken = () => 'meu-token';

    http.get('/favoritos').subscribe();

    const req = httpMock.expectOne('/favoritos');
    expect(req.request.headers.get('Authorization')).toBe('Bearer meu-token');
    req.flush({});
  });
});
