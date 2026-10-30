import type { Estado } from '../storage/estado.ts';

export const XP_PRIMEIRA_TENTATIVA = 10;
export const XP_DEPOIS_DO_ERRO = 5;

/** +10 por acerto de primeira, +5 por acerto depois de errar. */
export function xpDoAcerto(primeiraTentativa: boolean): number {
  return primeiraTentativa ? XP_PRIMEIRA_TENTATIVA : XP_DEPOIS_DO_ERRO;
}

/** Refazer uma lição já concluída não dá XP: só a primeira vez conta. */
export function xpDaLicao(refeita: boolean, xpBruto: number): number {
  return refeita ? 0 : xpBruto;
}

/** XP do dia; zera sozinho quando o dia guardado não é o de hoje. */
export function xpDeHoje(estado: Pick<Estado, 'xpHoje'>, hoje: string): number {
  return estado.xpHoje.dia === hoje ? estado.xpHoje.valor : 0;
}

export function adicionarXp<T extends Pick<Estado, 'xp' | 'xpHoje'>>(
  estado: T,
  pontos: number,
  hoje: string,
): T {
  return {
    ...estado,
    xp: estado.xp + pontos,
    xpHoje: { dia: hoje, valor: xpDeHoje(estado, hoje) + pontos },
  };
}

export function metaAtingida(estado: Pick<Estado, 'xpHoje' | 'config'>, hoje: string): boolean {
  return xpDeHoje(estado, hoje) >= estado.config.metaDiaria;
}
