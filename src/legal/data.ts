const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "2026-11-06" vira "6 de novembro de 2026". */
export function dataPorExtenso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const mes = m ? MESES[Number(m[2]) - 1] : undefined;
  if (!m || !mes) return iso;
  return `${Number(m[3])} de ${mes} de ${m[1]}`;
}
