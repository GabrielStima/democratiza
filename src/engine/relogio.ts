/**
 * Relógio injetável. Nenhuma outra parte do app pode chamar `new Date()` ou `Date.now()`:
 * tudo passa por `agora()`, que os testes e o /_dev conseguem trocar.
 */
let fonte: () => Date = () => new Date();
let deslocamento = 0;

export function agora(): Date {
  const d = fonte();
  if (deslocamento !== 0) d.setDate(d.getDate() + deslocamento);
  return d;
}

/** Troca a fonte da hora (testes). Sem argumento, volta ao relógio real. */
export function usarRelogio(nova?: () => Date): void {
  fonte = nova ?? (() => new Date());
}

/** Avança (ou volta) o relógio em dias inteiros. Usado só pelo /_dev. */
export function definirDeslocamento(dias: number): void {
  deslocamento = dias;
}

export function deslocamentoAtual(): number {
  return deslocamento;
}

const dois = (n: number) => String(n).padStart(2, '0');

/** Dia local de uma data, no formato AAAA-MM-DD. */
export function diaDe(d: Date): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export function hoje(): string {
  return diaDe(agora());
}

function paraUtc(dia: string): number {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  return Date.UTC(a, m - 1, d);
}

export function somarDias(dia: string, n: number): string {
  const d = new Date(paraUtc(dia) + n * 86_400_000);
  return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())}`;
}

/** Quantos dias de `de` até `ate` (negativo se `ate` vem antes). */
export function diasEntre(de: string, ate: string): number {
  return Math.round((paraUtc(ate) - paraUtc(de)) / 86_400_000);
}
