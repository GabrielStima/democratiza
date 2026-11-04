import { describe, expect, it } from 'vitest';
import { deslocamento, DESLOCAMENTOS, nosDaUnidade, rotuloDoNo, tipoDoNo } from './nos.ts';

describe('zigue-zague da trilha', () => {
  it('segue o desenho e repete a cada 8 nós', () => {
    expect(DESLOCAMENTOS).toEqual([0, -46, -64, -46, 0, 46, 64, 46]);
    expect([0, 1, 2, 3, 4].map(deslocamento)).toEqual([0, -46, -64, -46, 0]);
    expect(deslocamento(8)).toBe(0);
    expect(deslocamento(10)).toBe(-64);
    expect(deslocamento(-1)).toBe(46);
  });
});

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

describe('nome do nó', () => {
  it('diz o estado para leitor de tela, e a atual começa com o balão', () => {
    expect(rotuloDoNo({ titulo: 'Executivo', tipo: 'feita' })).toBe('Executivo (feita)');
    expect(rotuloDoNo({ titulo: 'Legislativo', tipo: 'atual' })).toBe('Começar: Legislativo');
    expect(rotuloDoNo({ titulo: 'Judiciário', tipo: 'bloqueada' })).toBe('Judiciário (bloqueada)');
    expect(rotuloDoNo({ titulo: 'Desafio', tipo: 'desafio' })).toContain('desafio da unidade');
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
  });
});
