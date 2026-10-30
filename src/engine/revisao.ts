import type { Caderno, EntradaCaderno } from '../storage/estado.ts';
import { diasEntre, somarDias } from './relogio.ts';

/** Intervalo, em dias, de cada caixa do Leitner (caixas 1 a 5). */
export const INTERVALOS_DIAS = [1, 3, 7, 15, 30] as const;
export const MAX_SESSAO = 10;

function intervalo(caixa: number): number {
  return INTERVALOS_DIAS[Math.min(5, Math.max(1, caixa)) - 1] as number;
}

/** Conceito recém-aprendido: caixa 1, volta amanhã. */
export function novaEntrada(conceitoId: string, licaoId: string, dia: string): EntradaCaderno {
  return {
    conceitoId,
    caixa: 1,
    proximaRevisao: somarDias(dia, intervalo(1)),
    ultimaRevisao: null,
    aprendidoEm: dia,
    licaoId,
  };
}

/** Errou: volta para a caixa 1. Acertou: sobe uma caixa (no máximo a 5). */
export function registrarResultado(
  e: EntradaCaderno,
  acertou: boolean,
  dia: string,
): EntradaCaderno {
  const caixa = acertou ? Math.min(5, e.caixa + 1) : 1;
  return {
    ...e,
    caixa,
    proximaRevisao: somarDias(dia, intervalo(caixa)),
    ultimaRevisao: dia,
  };
}

export function venceu(e: EntradaCaderno, hoje: string): boolean {
  return diasEntre(e.proximaRevisao, hoje) >= 0;
}

/** Conceitos vencidos, os mais atrasados primeiro. */
export function conceitosVencidos(caderno: Caderno, hoje: string): EntradaCaderno[] {
  return Object.values(caderno)
    .filter((e) => venceu(e, hoje))
    .sort(
      (a, b) =>
        a.proximaRevisao.localeCompare(b.proximaRevisao) ||
        a.conceitoId.localeCompare(b.conceitoId),
    );
}

/** Quem entra na sessão de hoje: no máximo 10, os mais atrasados primeiro. */
export function selecionarSessao(caderno: Caderno, hoje: string): EntradaCaderno[] {
  return conceitosVencidos(caderno, hoje).slice(0, MAX_SESSAO);
}

/** Quantos conceitos vencem em cada um dos próximos dias (só os dias com revisão). */
export function proximasRevisoes(
  caderno: Caderno,
  hoje: string,
  horizonteDias = 14,
): { dia: string; quantidade: number }[] {
  const contagem = new Map<string, number>();
  for (const e of Object.values(caderno)) {
    const d = diasEntre(hoje, e.proximaRevisao);
    if (d >= 1 && d <= horizonteDias) {
      contagem.set(e.proximaRevisao, (contagem.get(e.proximaRevisao) ?? 0) + 1);
    }
  }
  return [...contagem.entries()]
    .map(([dia, quantidade]) => ({ dia, quantidade }))
    .sort((a, b) => a.dia.localeCompare(b.dia));
}

export interface ResultadoConceito {
  conceitoId: string;
  acertou: boolean;
}

/**
 * Aplica os resultados de uma sessão. No treino livre ("Treinar este curso")
 * nada muda: sem XP e sem mexer nas caixas.
 */
export function aplicarRevisao(
  caderno: Caderno,
  resultados: ResultadoConceito[],
  dia: string,
  modo: 'revisao' | 'treino',
): Caderno {
  if (modo === 'treino') return caderno;
  const novo = { ...caderno };
  for (const r of resultados) {
    const atual = novo[r.conceitoId];
    if (atual) novo[r.conceitoId] = registrarResultado(atual, r.acertou, dia);
  }
  return novo;
}
