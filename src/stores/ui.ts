import { signal } from '@preact/signals';

/**
 * Janela da meta diária: "primeira" para quem começa (leva à primeira lição) e "mudar" para
 * quem já estuda e clica na meta de hoje.
 */
export const janelaMeta = signal<'fechada' | 'primeira' | 'mudar'>('fechada');

export function abrirMeta(modo: 'primeira' | 'mudar'): void {
  janelaMeta.value = modo;
}

export function fecharMeta(): void {
  janelaMeta.value = 'fechada';
}
