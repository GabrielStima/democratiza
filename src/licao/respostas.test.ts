import { describe, expect, it } from 'vitest';
import type { Apresentacao } from './pratica.ts';
import {
  corrigir,
  descreverCerta,
  descreverMarcacao,
  embaralhar,
  estaPronto,
  marcacaoInicial,
  ordemDosItens,
} from './respostas.ts';

const classificar: Extract<Apresentacao, { forma: 'classificar' }> = {
  forma: 'classificar',
  rotulo: 'Classificar',
  enunciado: 'Onde fica cada item?',
  categorias: [
    { nome: 'A', dica: 'a' },
    { nome: 'B', dica: 'b' },
  ],
  itens: [
    { texto: 'um', categoria: 0 },
    { texto: 'dois', categoria: 1 },
    { texto: 'três', categoria: 0 },
  ],
};
const ordenar: Extract<Apresentacao, { forma: 'ordenar' }> = {
  forma: 'ordenar',
  rotulo: 'Ordenar',
  enunciado: 'Qual a ordem?',
  etapas: ['primeira', 'segunda', 'terceira', 'quarta'],
};
const opcoes: Extract<Apresentacao, { forma: 'opcoes' }> = {
  forma: 'opcoes',
  rotulo: 'Pergunta',
  enunciado: 'p',
  opcoes: ['x', 'y'],
  correta: 1,
  grandes: false,
};

describe('embaralhar', () => {
  it('é uma permutação e sempre a mesma para o mesmo texto', () => {
    const a = embaralhar(6, 'abc');
    expect([...a].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(embaralhar(6, 'abc')).toEqual(a);
  });
  it('textos diferentes dão ordens diferentes (em geral)', () => {
    const ordens = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((t) => embaralhar(5, t).join()));
    expect(ordens.size).toBeGreaterThan(1);
  });
  it('nunca devolve a ordem original quando há mais de um item', () => {
    for (let i = 0; i < 200; i++) {
      const o = embaralhar(3, `semente-${i}`);
      expect(o.every((v, p) => v === p)).toBe(false);
    }
    expect(embaralhar(1, 'x')).toEqual([0]);
    expect(embaralhar(0, 'x')).toEqual([]);
  });
});

describe('marcacaoInicial e estaPronto', () => {
  it('escolha única começa sem nada marcado', () => {
    expect(marcacaoInicial(opcoes)).toBeNull();
    expect(estaPronto(opcoes, null)).toBe(false);
    expect(estaPronto(opcoes, 0)).toBe(true);
  });
  it('classificar começa com nada colocado e só fica pronto com tudo colocado', () => {
    const m = marcacaoInicial(classificar);
    expect(m).toEqual([-1, -1, -1]);
    expect(estaPronto(classificar, m)).toBe(false);
    expect(estaPronto(classificar, [0, -1, 1])).toBe(false);
    expect(estaPronto(classificar, [0, 1, 0])).toBe(true);
  });
  it('ordenar começa embaralhado, já pronto para verificar e fora da ordem certa', () => {
    const m = marcacaoInicial(ordenar);
    expect(estaPronto(ordenar, m)).toBe(true);
    expect(corrigir(ordenar, m ?? [])).toBe(false);
    expect([...(m as number[])].sort()).toEqual([0, 1, 2, 3]);
  });
  it('a ordem dos itens soltos é fixa para a mesma pergunta', () => {
    expect(ordemDosItens(classificar)).toEqual(ordemDosItens(classificar));
    expect([...ordemDosItens(classificar)].sort()).toEqual([0, 1, 2]);
  });
});

describe('corrigir', () => {
  it('escolha única compara a posição', () => {
    expect(corrigir(opcoes, 1)).toBe(true);
    expect(corrigir(opcoes, 0)).toBe(false);
    expect(corrigir(opcoes, [1])).toBe(false);
  });
  it('classificar acerta só com todos os itens na categoria certa', () => {
    expect(corrigir(classificar, [0, 1, 0])).toBe(true);
    expect(corrigir(classificar, [0, 1, 1])).toBe(false);
    expect(corrigir(classificar, [1, 0, 1])).toBe(false);
    expect(corrigir(classificar, 0)).toBe(false);
  });
  it('ordenar acerta só com todas as etapas na ordem certa', () => {
    expect(corrigir(ordenar, [0, 1, 2, 3])).toBe(true);
    expect(corrigir(ordenar, [0, 1, 3, 2])).toBe(false);
    expect(corrigir(ordenar, [0, 1, 2])).toBe(false);
  });
});

describe('descreverMarcacao e descreverCerta', () => {
  it('escolha única mostra o texto da opção', () => {
    expect(descreverMarcacao(opcoes, 0)).toEqual(['x']);
    expect(descreverCerta(opcoes)).toEqual(['y']);
  });
  it('classificar mostra item → categoria', () => {
    expect(descreverMarcacao(classificar, [1, 1, 0])).toEqual(['um → B', 'dois → B', 'três → A']);
    expect(descreverCerta(classificar)).toEqual(['um → A', 'dois → B', 'três → A']);
  });
  it('ordenar mostra a lista numerada', () => {
    expect(descreverMarcacao(ordenar, [1, 0, 2, 3])).toEqual([
      '1. segunda',
      '2. primeira',
      '3. terceira',
      '4. quarta',
    ]);
    expect(descreverCerta(ordenar)[3]).toBe('4. quarta');
  });
});
