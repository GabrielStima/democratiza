import { definirDeslocamento, deslocamentoAtual } from '../engine/relogio.ts';

const CHAVE = 'democratiza:dev-dias';

/** Restaura o relógio simulado do /_dev (só dev e prévias). */
export function iniciarRelogioDev(): void {
  try {
    definirDeslocamento(Number(localStorage.getItem(CHAVE) ?? 0) || 0);
  } catch {
    /* sem localStorage: relógio real */
  }
}

/** Avança (ou volta) o relógio simulado em dias e lembra a escolha. */
export function moverRelogio(dias: number): number {
  const novo = deslocamentoAtual() + dias;
  definirDeslocamento(novo);
  try {
    localStorage.setItem(CHAVE, String(novo));
  } catch {
    /* ignora */
  }
  return novo;
}

export function zerarRelogio(): void {
  definirDeslocamento(0);
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}
