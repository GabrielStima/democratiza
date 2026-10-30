import { describe, expect, it } from 'vitest';
import type { Licao } from '../content-schema/licao.ts';
import {
  andamentoDoPasso,
  dividirTermos,
  enderecoDaIssue,
  fasesDoPasso,
  indiceAnterior,
  indiceDoAndamento,
  passosDaLicao,
  rotuloDoBotao,
} from './fluxo.ts';

const fonte = { descricao: 'Lorem Ipsum, fonte de exemplo, cap. 1' };
const checagem = {
  tipo: 'multipla_escolha' as const,
  pergunta: 'p?',
  opcoes: ['a', 'b', 'c'],
  correta: 1,
  reexplicacao: 'r',
};
function licao(cards: boolean[]): Licao {
  return {
    titulo: 'Lorem',
    status: 'rascunho',
    ensina: ['lorem-01'],
    situacao: { texto: 's', palpites: ['a', 'b', 'c'] },
    explicacao: cards.map((c, i) => ({
      titulo: `c${i}`,
      texto: 't',
      glossario: {},
      fonte,
      ...(c ? { checagem } : {}),
    })),
    pratica: [],
  };
}
const desafio: Licao = {
  titulo: 'Desafio',
  status: 'rascunho',
  tipo: 'desafio',
  ensina: [],
  pratica: [],
};

describe('passosDaLicao', () => {
  it('põe a checagem logo depois do card que a tem', () => {
    expect(passosDaLicao(licao([true, true])).map((p) => p.tipo)).toEqual([
      'situacao',
      'card',
      'checagem',
      'card',
      'checagem',
      'fim',
      'pratica',
    ]);
    expect(passosDaLicao(licao([false, true])).map((p) => p.tipo)).toEqual([
      'situacao',
      'card',
      'card',
      'checagem',
      'fim',
      'pratica',
    ]);
  });
  it('lição de desafio vai direto à Prática', () => {
    expect(passosDaLicao(desafio)).toEqual([{ tipo: 'pratica' }]);
  });
});

describe('andamento', () => {
  const passos = passosDaLicao(licao([true, true]));
  it('ida e volta de cada passo', () => {
    passos.forEach((p, i) => {
      expect(indiceDoAndamento(passos, andamentoDoPasso('a/b/c', p, 1))).toBe(i);
    });
  });
  it('guarda o palpite só quando existe', () => {
    expect(andamentoDoPasso('x', { tipo: 'situacao' }, null)).toEqual({
      id: 'x',
      etapa: 'situacao',
    });
    expect(andamentoDoPasso('x', { tipo: 'card', i: 1 }, 2)).toEqual({
      id: 'x',
      etapa: 'explicacao',
      card: 1,
      palpite: 2,
    });
  });
  it('volta ao começo se o card salvo não existe mais', () => {
    expect(indiceDoAndamento(passos, { id: 'x', etapa: 'explicacao', card: 9 })).toBe(0);
    expect(indiceDoAndamento(passos, null)).toBe(0);
  });
});

describe('indiceAnterior', () => {
  const passos = passosDaLicao(licao([true, true]));
  it('não há anterior na primeira etapa', () => {
    expect(indiceAnterior(passos, 0)).toBeNull();
  });
  it('do card 2 volta ao card 1; da checagem volta ao próprio card', () => {
    expect(indiceAnterior(passos, 3)).toBe(1);
    expect(indiceAnterior(passos, 2)).toBe(1);
    expect(indiceAnterior(passos, 1)).toBe(0);
  });
  it('do fim volta ao passo anterior', () => {
    expect(indiceAnterior(passos, 5)).toBe(4);
  });
});

describe('fasesDoPasso', () => {
  const passos = passosDaLicao(licao([true, true]));
  const estados = (i: number) => fasesDoPasso(passos, i).map((f) => f.estado);
  it('segue a fase da etapa', () => {
    expect(estados(0)).toEqual(['atual', 'proxima', 'proxima', 'proxima']);
    expect(estados(1)).toEqual(['feita', 'atual', 'proxima', 'proxima']);
    expect(estados(2)).toEqual(['feita', 'atual', 'proxima', 'proxima']);
    expect(estados(4)).toEqual(['feita', 'feita', 'atual', 'proxima']);
    expect(estados(5)).toEqual(['feita', 'feita', 'feita', 'proxima']);
    expect(estados(6)).toEqual(['feita', 'feita', 'feita', 'atual']);
  });
});

describe('rótulos e termos', () => {
  it('rotula o botão principal', () => {
    expect(rotuloDoBotao({ tipo: 'situacao' }, false)).toBe('Ver explicação');
    expect(rotuloDoBotao({ tipo: 'card', i: 0 }, false)).toBe('Entendi');
    expect(rotuloDoBotao({ tipo: 'checagem', i: 0 }, false)).toBe('Verificar');
    expect(rotuloDoBotao({ tipo: 'checagem', i: 0 }, true)).toBe('Continuar');
    expect(rotuloDoBotao({ tipo: 'fim' }, false)).toBe('Começar prática');
  });
  it('divide [[termo]] do texto', () => {
    expect(dividirTermos('Veja o [[a b]] e o [[c]].')).toEqual([
      { tipo: 'texto', valor: 'Veja o ' },
      { tipo: 'termo', valor: 'a b' },
      { tipo: 'texto', valor: ' e o ' },
      { tipo: 'termo', valor: 'c' },
      { tipo: 'texto', valor: '.' },
    ]);
    expect(dividirTermos('sem termos')).toEqual([{ tipo: 'texto', valor: 'sem termos' }]);
  });
  it('monta a issue com a lição e o card', () => {
    const url = new URL(enderecoDaIssue('c/u/l', 1));
    expect(url.pathname).toBe('/GabrielStima/democratiza/issues/new');
    expect(url.searchParams.get('title')).toContain('c/u/l');
    expect(url.searchParams.get('body')).toContain('Card: 2');
  });
});
