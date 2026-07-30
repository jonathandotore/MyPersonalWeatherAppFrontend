export type FonteMaxMin = 'previsao' | 'leitura-atual';

export interface ClimaAtual {
  cidade: string;
  paisCodigo: string;
  temperatura: number;
  sensacaoTermica: number;
  temperaturaMaxima: number;
  temperaturaMinima: number;
  umidade: number;
  condicao: string;
  icone: string;
  iconeUrl: string;
  latitude: number;
  longitude: number;
  dataHoraLocal: string;
  fonteMaxMin: FonteMaxMin;
}
