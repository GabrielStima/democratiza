import type { Apresentacao, Marcacao } from './pratica.ts';

/** Gerador pseudoaleatório pequeno e repetível (mulberry32). */
function gerador(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Uma permutação de 0 a n-1 que depende só do texto. Recarregar a página ou voltar à
 * pergunta mostra sempre a mesma ordem, e a mesma pergunta nunca sai igual à de partida.
 */
export function embaralhar(n: number, semente: string): number[] {
  const lista = Array.from({ length: n }, (_, i) => i);
  const sorteio = gerador(hash(semente));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [lista[i], lista[j]] = [lista[j] as number, lista[i] as number];
  }
  const igual = lista.every((v, i) => v === i);
  return igual && n > 1 ? [...lista.slice(1), lista[0] as number] : lista;
}

/** Ordem em que os itens de `classificar` aparecem soltos (posições em `itens`). */
export function ordemDosItens(ap: Extract<Apresentacao, { forma: 'classificar' }>): number[] {
  return embaralhar(ap.itens.length, `${ap.enunciado}|${ap.itens.map((i) => i.texto).join('|')}`);
}

/**
 * Ponto de partida de cada exercício: nada marcado nas escolhas únicas, nenhum item
 * colocado em `classificar` e as etapas embaralhadas em `ordenar`.
 */
export function marcacaoInicial(ap: Apresentacao): Marcacao | null {
  switch (ap.forma) {
    case 'opcoes':
      return null;
    case 'classificar':
      return ap.itens.map(() => -1);
    case 'ordenar':
      return embaralhar(ap.etapas.length, `${ap.enunciado}|${ap.etapas.join('|')}`);
  }
}

/** O botão "Verificar" só ativa com isto verdadeiro. */
export function estaPronto(ap: Apresentacao, m: Marcacao | null): boolean {
  if (m === null) return false;
  switch (ap.forma) {
    case 'opcoes':
      return typeof m === 'number';
    case 'classificar':
      return Array.isArray(m) && m.length === ap.itens.length && m.every((c) => c >= 0);
    case 'ordenar':
      return Array.isArray(m) && m.length === ap.etapas.length;
  }
}

/** Acerta só quando tudo está certo: a opção, todos os itens ou todas as etapas. */
export function corrigir(ap: Apresentacao, m: Marcacao): boolean {
  switch (ap.forma) {
    case 'opcoes':
      return m === ap.correta;
    case 'classificar':
      return Array.isArray(m) && ap.itens.every((item, i) => m[i] === item.categoria);
    case 'ordenar':
      return Array.isArray(m) && m.length === ap.etapas.length && m.every((v, i) => v === i);
  }
}

/** Texto do que a pessoa marcou, uma linha por item (para "Rever o que errei"). */
export function descreverMarcacao(ap: Apresentacao, m: Marcacao): string[] {
  switch (ap.forma) {
    case 'opcoes':
      return [typeof m === 'number' ? (ap.opcoes[m] ?? '') : ''];
    case 'classificar':
      return ap.itens.map((item, i) => {
        const c = Array.isArray(m) ? m[i] : undefined;
        return `${item.texto} → ${c !== undefined ? (ap.categorias[c]?.nome ?? '?') : '?'}`;
      });
    case 'ordenar':
      return Array.isArray(m) ? m.map((v, i) => `${i + 1}. ${ap.etapas[v] ?? ''}`) : [];
  }
}

/** Texto da resposta certa, no mesmo formato de `descreverMarcacao`. */
export function descreverCerta(ap: Apresentacao): string[] {
  switch (ap.forma) {
    case 'opcoes':
      return [ap.opcoes[ap.correta] ?? ''];
    case 'classificar':
      return ap.itens.map(
        (item) => `${item.texto} → ${ap.categorias[item.categoria]?.nome ?? '?'}`,
      );
    case 'ordenar':
      return ap.etapas.map((e, i) => `${i + 1}. ${e}`);
  }
}
