export interface PrevisaoDiaria {
  data: string;
  temperaturaMaxima: number;
  temperaturaMinima: number;
  condicao: string;
  icone: string;
  iconeUrl: string;
  probabilidadeChuva: number;
}

export interface PrevisaoResposta {
  cidade: string;
  paisCodigo: string;
  dias: PrevisaoDiaria[];
}
