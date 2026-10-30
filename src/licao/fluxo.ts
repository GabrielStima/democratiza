import type { Licao } from '../content-schema/licao.ts';
import type { Estado } from '../storage/estado.ts';

/** Um lugar da lição por onde a pessoa passa, na ordem. */
export type Passo =
  | { tipo: 'situacao' }
  | { tipo: 'card'; i: number }
  | { tipo: 'checagem'; i: number }
  | { tipo: 'fim' }
  | { tipo: 'pratica' };

export type Andamento = NonNullable<Estado['licaoEmAndamento']>;

export type EstadoFase = 'feita' | 'atual' | 'proxima';
export interface Fase {
  rotulo: string;
  estado: EstadoFase;
}

export const ROTULOS_FASES = ['Situação', 'Explicação', 'Checagem', 'Prática'] as const;

/** Situação, cada card (com a checagem dele, se houver), fim da explicação e Prática. */
export function passosDaLicao(licao: Licao): Passo[] {
  if (licao.tipo === 'desafio') return [{ tipo: 'pratica' }];
  const passos: Passo[] = [];
  if (licao.situacao) passos.push({ tipo: 'situacao' });
  (licao.explicacao ?? []).forEach((card, i) => {
    passos.push({ tipo: 'card', i });
    if (card.checagem) passos.push({ tipo: 'checagem', i });
  });
  passos.push({ tipo: 'fim' }, { tipo: 'pratica' });
  return passos;
}

/** O que gravar em `licaoEmAndamento` para um passo. */
export function andamentoDoPasso(
  id: string,
  passo: Passo,
  palpite: number | null,
  pratica?: Andamento['pratica'],
): Andamento {
  const base = {
    id,
    ...(palpite === null ? {} : { palpite }),
    ...(pratica && pratica.resultados.length > 0 ? { pratica } : {}),
  };
  switch (passo.tipo) {
    case 'situacao':
      return { ...base, etapa: 'situacao' };
    case 'card':
      return { ...base, etapa: 'explicacao', card: passo.i };
    case 'checagem':
      return { ...base, etapa: 'checagem', card: passo.i };
    case 'fim':
      return { ...base, etapa: 'fim' };
    case 'pratica':
      return { ...base, etapa: 'pratica' };
  }
}

/** Posição do passo salvo; 0 (o começo) quando o salvo não existe mais na lição. */
export function indiceDoAndamento(passos: Passo[], andamento: Andamento | null): number {
  if (!andamento) return 0;
  const i = passos.findIndex((p) => {
    if (andamento.etapa === 'explicacao') return p.tipo === 'card' && p.i === andamento.card;
    if (andamento.etapa === 'checagem') return p.tipo === 'checagem' && p.i === andamento.card;
    if (andamento.etapa === 'situacao') return p.tipo === 'situacao';
    return p.tipo === andamento.etapa;
  });
  return i === -1 ? 0 : i;
}

/**
 * Para onde o Voltar leva. Do card vai ao card anterior (sem passar pela checagem dele);
 * da checagem volta ao próprio card.
 */
export function indiceAnterior(passos: Passo[], indice: number): number | null {
  const atual = passos[indice];
  if (!atual || indice === 0) return null;
  if (atual.tipo === 'checagem')
    return passos.findIndex((p) => p.tipo === 'card' && p.i === atual.i);
  if (atual.tipo === 'card') {
    const antes = passos.findIndex((p) => p.tipo === 'card' && p.i === atual.i - 1);
    if (antes !== -1) return antes;
  }
  return indice - 1;
}

/** As quatro pílulas do topo para o passo atual. */
export function fasesDoPasso(passos: Passo[], indice: number): Fase[] {
  const passo = passos[indice];
  const ultimoCard = Math.max(-1, ...passos.flatMap((p) => (p.tipo === 'card' ? [p.i] : [])));
  let atual = 0;
  if (passo?.tipo === 'card') atual = 1;
  else if (passo?.tipo === 'checagem') atual = passo.i < ultimoCard ? 1 : 2;
  else if (passo?.tipo === 'pratica') atual = 3;
  // Fim da explicação: as três primeiras prontas e a Prática ainda por começar.
  const noFim = passo?.tipo === 'fim';
  return ROTULOS_FASES.map((rotulo, n) => {
    const limite = noFim ? 3 : atual;
    const estado: EstadoFase = n < limite ? 'feita' : n === limite && !noFim ? 'atual' : 'proxima';
    return { rotulo, estado };
  });
}

/** Todas as pílulas prontas: a lição foi concluída. */
export function fasesConcluidas(): Fase[] {
  return ROTULOS_FASES.map((rotulo) => ({ rotulo, estado: 'feita' as const }));
}

export function rotuloDoBotao(passo: Passo, verificado: boolean): string {
  switch (passo.tipo) {
    case 'situacao':
      return 'Ver explicação';
    case 'card':
      return 'Entendi';
    case 'checagem':
      return verificado ? 'Continuar' : 'Verificar';
    case 'fim':
      return 'Começar prática';
    case 'pratica':
      return 'Continuar';
  }
}

/** Divide um texto com [[termo]] em pedaços de texto e termos. */
export type Pedaco = { tipo: 'texto' | 'termo'; valor: string };
export function dividirTermos(texto: string): Pedaco[] {
  const pedacos: Pedaco[] = [];
  let resto = 0;
  for (const m of texto.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const inicio = m.index ?? 0;
    if (inicio > resto) pedacos.push({ tipo: 'texto', valor: texto.slice(resto, inicio) });
    pedacos.push({ tipo: 'termo', valor: m[1] ?? '' });
    resto = inicio + m[0].length;
  }
  if (resto < texto.length) pedacos.push({ tipo: 'texto', valor: texto.slice(resto) });
  return pedacos;
}

export const REPOSITORIO = 'https://github.com/GabrielStima/democratiza';

/** Endereço de uma issue já preenchida com a lição e o card. */
export function enderecoDaIssue(licaoId: string, card: number): string {
  const titulo = `Erro na lição ${licaoId}, card ${card + 1}`;
  const corpo = [
    `Lição: \`${licaoId}\``,
    `Card: ${card + 1}`,
    '',
    'O que está errado (e, se puder, a fonte que mostra o certo):',
    '',
  ].join('\n');
  const q = new URLSearchParams({ title: titulo, body: corpo });
  return `${REPOSITORIO}/issues/new?${q.toString()}`;
}
