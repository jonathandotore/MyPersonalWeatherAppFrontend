import { HttpErrorResponse } from '@angular/common/http';
import type { ProblemDetails } from '../models/problem-details.model';

/**
 * Extrai uma mensagem amigável de um erro de `httpResource`/`HttpClient`.
 * A API sempre responde erros em ProblemDetails (RFC 9457) — ver README do backend.
 */
export function extrairMensagemDeErro(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
    }

    const problemDetails = error.error as ProblemDetails | null;
    if (problemDetails?.detail) {
      return problemDetails.detail;
    }
    if (problemDetails?.title) {
      return problemDetails.title;
    }
    return `Erro inesperado (HTTP ${error.status}).`;
  }

  return 'Erro inesperado. Tente novamente.';
}
