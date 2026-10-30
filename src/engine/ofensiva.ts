import type { Estado } from '../storage/estado.ts';
import { diasEntre, somarDias } from './relogio.ts';

type Ofensiva = Estado['ofensiva'];

/** Registra que a pessoa estudou em `dia` (lição ou revisão concluída). */
export function registrarEstudo(o: Ofensiva, dia: string): Ofensiva {
  const { ultimoDia } = o;
  // O relógio andou para trás (mudança de fuso ou de data): não conta de novo nem zera.
  if (ultimoDia !== null && diasEntre(ultimoDia, dia) <= 0) return o;
  const atual = ultimoDia !== null && diasEntre(ultimoDia, dia) === 1 ? o.atual + 1 : 1;
  return { atual, recorde: Math.max(o.recorde, atual), ultimoDia: dia };
}

/** Dias seguidos para mostrar: vira 0 quando passou um dia inteiro sem estudar. */
export function ofensivaAtual(o: Ofensiva, hoje: string): number {
  if (o.ultimoDia === null) return 0;
  return diasEntre(o.ultimoDia, hoje) <= 1 ? o.atual : 0;
}

/** Estudou ontem mas ainda não hoje: a ofensiva está viva, mas em risco. */
export function ofensivaEmRisco(o: Ofensiva, hoje: string): boolean {
  return o.ultimoDia !== null && o.atual > 0 && diasEntre(o.ultimoDia, hoje) === 1;
}

/** Guarda só os últimos 30 dias, sem repetir, em ordem. */
export function registrarDiaEstudado(dias: string[], dia: string, hoje: string): string[] {
  const limite = somarDias(hoje, -29);
  return [...new Set([...dias, dia])].filter((d) => diasEntre(limite, d) >= 0).sort();
}

/** Os 7 dias que terminam hoje, com marca de quais tiveram estudo (pontinhos da Home). */
export function ultimosSeteDias(dias: string[], hoje: string): { dia: string; estudou: boolean }[] {
  const set = new Set(dias);
  return Array.from({ length: 7 }, (_, i) => {
    const dia = somarDias(hoje, i - 6);
    return { dia, estudou: set.has(dia) };
  });
}
