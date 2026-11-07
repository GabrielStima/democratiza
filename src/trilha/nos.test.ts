import { describe, expect, it } from 'vitest';
import { nosDaUnidade, tipoDoNo } from './nos.ts';

describe('tipo do nó', () => {
  it('bloqueada vira troféu só quando é o desafio da unidade', () => {
    expect(tipoDoNo('bloqueada', false)).toBe('bloqueada');
    expect(tipoDoNo('bloqueada', true)).toBe('desafio');
  });
  it('feita e atual não mudam, mesmo no desafio', () => {
    expect(tipoDoNo('feita', true)).toBe('feita');
    expect(tipoDoNo('atual', true)).toBe('atual');
    expect(tipoDoNo('atual', false)).toBe('atual');
  });
});

describe('nós de uma unidade', () => {
  it('mantém a ordem e transforma o desafio bloqueado em troféu', () => {
    const nos = nosDaUnidade({
      licoes: [
        {
          id: 'a',
          numero: 1,
          titulo: 'A',
          desafio: false,
          estado: 'feita',
          conceitos: [],
          destino: '/c/x/u/a',
        },
        {
          id: 'b',
          numero: 2,
          titulo: 'B',
          desafio: false,
          estado: 'atual',
          conceitos: [],
          destino: '/c/x/u/b',
        },
        {
          id: 'c',
          numero: 3,
          titulo: 'C',
          desafio: true,
          estado: 'bloqueada',
          conceitos: [],
          destino: '/c/x/u/c',
        },
      ],
    });
    expect(nos.map((n) => [n.id, n.tipo, n.destino])).toEqual([
      ['a', 'feita', '/c/x/u/a'],
      ['b', 'atual', '/c/x/u/b'],
      ['c', 'desafio', '/c/x/u/c'],
    ]);
    expect(nos.map((n) => n.detalhe)).toEqual([
      '0 conceitos',
      '0 conceitos',
      'Revisão dos conceitos da unidade',
    ]);
  });
});
