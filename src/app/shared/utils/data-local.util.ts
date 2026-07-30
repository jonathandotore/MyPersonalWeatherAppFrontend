/**
 * Converte uma data local no formato "YYYY-MM-DD" (como a API devolve, sem
 * horário) em `Date`. Passar a string direto para `new Date()` a interpreta
 * como UTC meia-noite, o que desloca o dia em fusos negativos (ex.: Brasil).
 */
export function parseDataLocal(data: string): Date {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}
