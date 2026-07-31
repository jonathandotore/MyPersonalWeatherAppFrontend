/**
 * Caminhos relativos ao API_BASE_URL, espelhando o contrato documentado no
 * README do backend. `cidade` aceita "Nome" ou "Nome,PaisCodigo".
 */
export const apiEndpoints = {
  climaAtual: (cidade: string) => `/clima/${encodeURIComponent(cidade)}`,
  climaAtualPorCoordenadas: (latitude: number, longitude: number) =>
    `/clima/coordenadas?latitude=${latitude}&longitude=${longitude}`,
  previsao: (cidade: string) => `/clima/${encodeURIComponent(cidade)}/previsao`,
  previsaoPorCoordenadas: (latitude: number, longitude: number) =>
    `/clima/coordenadas/previsao?latitude=${latitude}&longitude=${longitude}`,
  favoritos: '/favoritos',
  favorito: (id: string) => `/favoritos/${encodeURIComponent(id)}`,
  login: '/auth/login',
  registro: '/auth/register',
} as const;
