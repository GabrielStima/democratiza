import { signal } from '@preact/signals';
import { definirLicaoEmAndamento, estado } from '../stores/index.ts';
import type { Andamento } from './fluxo.ts';

/**
 * Quem ainda não tem progresso salvo (visitante) não ganha um estado só por abrir uma lição:
 * o ponto em que parou fica na memória desta aba até a pessoa escolher a meta (M5).
 */
const andamentoDoVisitante = signal<Andamento | null>(null);

/** Onde a pessoa parou nesta lição; null se ela nunca abriu ou abriu outra. */
export function lerAndamento(id: string): Andamento | null {
  const e = estado.peek();
  const a = e ? e.licaoEmAndamento : andamentoDoVisitante.peek();
  return a && a.id === id ? a : null;
}

export function gravarAndamento(info: Andamento): void {
  if (estado.peek()) definirLicaoEmAndamento(info);
  else andamentoDoVisitante.value = info;
}
