import { Service, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { API_BASE_URL } from '../../core/config/api-config';
import { apiEndpoints } from '../../core/config/api-endpoints';
import { CidadePesquisada } from '../../shared/state/cidade-pesquisada';
import type { PrevisaoResposta } from '../../shared/models/previsao.model';

@Service()
export class ForecastState {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly cidadePesquisada = inject(CidadePesquisada);

  readonly previsao = httpResource<PrevisaoResposta>(() => {
    const cidade = this.cidadePesquisada.cidadeAtual().trim();
    return cidade ? `${this.baseUrl}${apiEndpoints.previsao(cidade)}` : undefined;
  });
}
