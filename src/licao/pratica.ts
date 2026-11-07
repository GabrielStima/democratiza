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
  /** Resposta dada: a opção marcada ou, em classificar e ordenar, a lista (ver `Marcacao`). */
  m: Marcacao;
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

/**
 * O que a pessoa marcou. Um número nos exercícios de escolha única (posição da opção);
 * uma lista em `classificar` (categoria de cada item, na ordem do JSON) e em `ordenar`
 * (a etapa que ficou em cada posição, contando as etapas na ordem certa do JSON).
 */
export type Marcacao = number | number[];

interface ApresentacaoBase {
  /** Rótulo curto acima da pergunta. */
  rotulo: string;
  enunciado: string;
}

/** Escolha única: múltipla escolha, verdadeiro ou falso, quem resolve e mito ou fato. */
export interface ApresentacaoOpcoes extends ApresentacaoBase {
  forma: 'opcoes';
  opcoes: string[];
  correta: number;
  /** Duas opções grandes lado a lado (verdadeiro ou falso, mito ou fato). */
  grandes: boolean;
  /** Mostra o enunciado num balão da Capi, com este texto no alto (mito ou fato). */
  balao?: string;
  /** Títulos do cartão, quando não são "Isso mesmo!" e "Não foi dessa vez". */
  tituloCerto?: string;
  tituloErrado?: string;
  /** Debate entre correntes (só em Módulos): o argumento e as leituras comparadas. */
  debate?: Debate;
}

export interface Leitura {
  nome: string;
  resumo: string;
  fonte: { descricao: string; link?: string | undefined };
}

export interface Debate {
  argumento: string;
  leituras: Leitura[];
}

export interface ApresentacaoClassificar extends ApresentacaoBase {
  forma: 'classificar';
  categorias: { nome: string; dica: string }[];
  /** `categoria` é a posição da categoria certa em `categorias`. */
  itens: { texto: string; categoria: number }[];
}

export interface ApresentacaoOrdenar extends ApresentacaoBase {
  forma: 'ordenar';
  /** Na ordem certa; a tela as mostra embaralhadas. */
  etapas: string[];
}

export type Apresentacao = ApresentacaoOpcoes | ApresentacaoClassificar | ApresentacaoOrdenar;

/** Pergunta fixa do debate entre correntes: associa o argumento a quem o defende. */
export const PERGUNTA_DO_DEBATE = 'De qual leitura vem este argumento?';

/** Como um exercício aparece na Prática; null se o tipo não tiver tela. */
export function apresentar(ex: Exercicio): Apresentacao | null {
  switch (ex.tipo) {
    case 'multipla_escolha':
      return {
        forma: 'opcoes',
        rotulo: ex.titulo_curto ?? 'Pergunta',
        enunciado: ex.pergunta,
        opcoes: ex.opcoes,
        correta: ex.correta,
        grandes: false,
      };
    case 'verdadeiro_falso':
      return {
        forma: 'opcoes',
        rotulo: ex.titulo_curto ?? 'Verdadeiro ou falso',
        enunciado: ex.afirmacao,
        opcoes: ['Verdadeiro', 'Falso'],
        correta: ex.correta ? 0 : 1,
        grandes: true,
      };
    case 'quem_resolve':
      return {
        forma: 'opcoes',
        rotulo: ex.titulo_curto ?? 'Quem resolve?',
        enunciado: ex.situacao,
        opcoes: ex.opcoes,
        correta: ex.correta,
        grandes: false,
      };
    case 'mito_ou_fato': {
      const certa = ex.correta === 'mito' ? 'é mito' : 'é fato';
      return {
        forma: 'opcoes',
        rotulo: ex.titulo_curto ?? 'Mito ou fato?',
        enunciado: `“${ex.frase}”`,
        opcoes: ['Mito', 'Fato'],
        correta: ex.correta === 'mito' ? 0 : 1,
        grandes: true,
        balao: 'Uma frase que circula por aí',
        tituloCerto: `Isso mesmo, ${certa}!`,
        tituloErrado: `Era ${ex.correta}`,
      };
    }
    case 'correntes':
      return {
        forma: 'opcoes',
        rotulo: ex.titulo_curto ?? 'Debate entre correntes',
        // A pergunta é sempre "quem defende o quê", nunca "qual leitura é a melhor".
        enunciado: PERGUNTA_DO_DEBATE,
        opcoes: ex.leituras.map((l) => l.nome),
        correta: ex.correta,
        grandes: false,
        debate: { argumento: ex.argumento, leituras: ex.leituras },
      };
    case 'classificar':
      return {
        forma: 'classificar',
        rotulo: ex.titulo_curto ?? 'Classificar',
        enunciado: ex.pergunta,
        categorias: ex.categorias,
        itens: ex.itens.map((i) => ({
          texto: i.texto,
          categoria: ex.categorias.findIndex((c) => c.nome === i.categoria),
        })),
      };
    case 'ordenar':
      return {
        forma: 'ordenar',
        rotulo: ex.titulo_curto ?? 'Ordenar',
        enunciado: ex.pergunta,
        etapas: ex.etapas,
      };
    default:
      return null;
  }
}

/** Posições dos exercícios que têm tela. */
export function indicesSuportados(licao: Licao): number[] {
  return licao.pratica.flatMap((ex, i) => (apresentar(ex) ? [i] : []));
}

export function formatarTempo(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
}
