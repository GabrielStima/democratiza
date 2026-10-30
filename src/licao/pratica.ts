import type { Exercicio } from '../content-schema/exercicio.ts';
import type { Licao } from '../content-schema/licao.ts';
import { xpDoAcerto } from '../engine/xp.ts';

/** Uma resposta dada. Guardada na ordem; dela se refaz a fila inteira. */
export interface Resultado {
  /** Posição do exercício em `licao.pratica`. */
  ex: number;
  ok: boolean;
  /** true quando é a segunda vez que a pergunta aparece (depois de um erro). */
  rep: boolean;
  /** Posição da opção marcada. */
  m: number;
  /** Segundos gastos na pergunta (no máximo 120). */
  s: number;
}

export interface ItemDaFila {
  ex: number;
  rep: boolean;
}

export interface EstadoPratica {
  fila: ItemDaFila[];
  /** Quantas respostas já valem (as que batem com a fila). */
  feitos: number;
  atual: ItemDaFila | null;
  terminou: boolean;
  xpBruto: number;
  acertosPrimeira: number;
  total: number;
  /** Exercícios errados na primeira vez, na ordem em que apareceram. */
  erradas: number[];
  segundos: number;
}

/**
 * Refaz a fila a partir das respostas: os exercícios na ordem e, no fim, cada pergunta errada
 * de primeira volta uma única vez. Resposta que não bate com a fila é ignorada (arquivo antigo).
 */
export function estadoDaPratica(indices: number[], resultados: Resultado[]): EstadoPratica {
  const fila: ItemDaFila[] = indices.map((ex) => ({ ex, rep: false }));
  let feitos = 0;
  let xpBruto = 0;
  let acertosPrimeira = 0;
  let segundos = 0;
  const erradas: number[] = [];
  for (const r of resultados) {
    const esperado = fila[feitos];
    if (!esperado || esperado.ex !== r.ex || esperado.rep !== r.rep) break;
    feitos++;
    segundos += r.s;
    if (r.ok) {
      xpBruto += xpDoAcerto(!r.rep);
      if (!r.rep) acertosPrimeira++;
    } else if (!r.rep) {
      erradas.push(r.ex);
      fila.push({ ex: r.ex, rep: true });
    }
  }
  const atual = fila[feitos] ?? null;
  return {
    fila,
    feitos,
    atual,
    terminou: atual === null,
    xpBruto,
    acertosPrimeira,
    total: indices.length,
    erradas,
    segundos,
  };
}

export interface Apresentacao {
  /** Rótulo curto acima da pergunta. */
  rotulo: string;
  enunciado: string;
  opcoes: string[];
  correta: number;
  /** Duas opções grandes lado a lado (verdadeiro ou falso). */
  grandes: boolean;
}

/** Como um exercício aparece na Prática; null para os tipos que ainda não têm tela. */
export function apresentar(ex: Exercicio): Apresentacao | null {
  switch (ex.tipo) {
    case 'multipla_escolha':
      return {
        rotulo: ex.titulo_curto ?? 'Pergunta',
        enunciado: ex.pergunta,
        opcoes: ex.opcoes,
        correta: ex.correta,
        grandes: false,
      };
    case 'verdadeiro_falso':
      return {
        rotulo: ex.titulo_curto ?? 'Verdadeiro ou falso',
        enunciado: ex.afirmacao,
        opcoes: ['Verdadeiro', 'Falso'],
        correta: ex.correta ? 0 : 1,
        grandes: true,
      };
    case 'quem_resolve':
      return {
        rotulo: ex.titulo_curto ?? 'Quem resolve?',
        enunciado: ex.situacao,
        opcoes: ex.opcoes,
        correta: ex.correta,
        grandes: false,
      };
    default:
      return null;
  }
}

/** Posições dos exercícios que têm tela hoje (os outros tipos entram nos M9 e M11). */
export function indicesSuportados(licao: Licao): number[] {
  return licao.pratica.flatMap((ex, i) => (apresentar(ex) ? [i] : []));
}

export function formatarTempo(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
}
