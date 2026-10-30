import { describe, expect, it } from 'vitest';
import type { Exercicio } from '../content-schema/exercicio.ts';
import { apresentar, estadoDaPratica, formatarTempo, type Resultado } from './pratica.ts';

const r = (ex: number, ok: boolean, rep = false, m = 0, s = 10): Resultado => ({
  ex,
  ok,
  rep,
  m,
  s,
});
const tudo = [0, 1, 2, 3, 4, 5];

describe('estadoDaPratica', () => {
  it('começa na primeira pergunta', () => {
    const e = estadoDaPratica(tudo, []);
    expect(e.atual).toEqual({ ex: 0, rep: false });
    expect(e.terminou).toBe(false);
  });
  it('seis acertos de primeira: 60 XP e 6 de 6', () => {
    const e = estadoDaPratica(
      tudo,
      tudo.map((i) => r(i, true)),
    );
    expect(e.terminou).toBe(true);
    expect(e.xpBruto).toBe(60);
    expect(e.acertosPrimeira).toBe(6);
    expect(e.erradas).toEqual([]);
  });
  it('um erro volta uma vez no fim: 5 de primeira e 1 depois do erro = 55 XP', () => {
    const e = estadoDaPratica(tudo, [
      r(0, true),
      r(1, true),
      r(2, false),
      r(3, true),
      r(4, true),
      r(5, true),
    ]);
    expect(e.fila.map((i) => `${i.ex}${i.rep ? 'r' : ''}`)).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '2r',
    ]);
    expect(e.atual).toEqual({ ex: 2, rep: true });
    const fim = estadoDaPratica(tudo, [
      r(0, true),
      r(1, true),
      r(2, false),
      r(3, true),
      r(4, true),
      r(5, true),
      r(2, true, true),
    ]);
    expect(fim.terminou).toBe(true);
    expect(fim.xpBruto).toBe(55);
    expect(fim.acertosPrimeira).toBe(5);
    expect(fim.erradas).toEqual([2]);
  });
  it('errar de novo na repetição não volta outra vez nem dá XP', () => {
    const e = estadoDaPratica([0], [r(0, false), r(0, false, true)]);
    expect(e.terminou).toBe(true);
    expect(e.xpBruto).toBe(0);
    expect(e.fila).toHaveLength(2);
  });
  it('perguntas erradas voltam na ordem em que erraram', () => {
    const e = estadoDaPratica([0, 1, 2], [r(0, false), r(1, false), r(2, true)]);
    expect(e.fila.slice(3).map((i) => i.ex)).toEqual([0, 1]);
  });
  it('ignora respostas que não batem com a fila', () => {
    const e = estadoDaPratica([0, 1], [r(0, true), r(9, true)]);
    expect(e.feitos).toBe(1);
    expect(e.xpBruto).toBe(10);
  });
  it('soma o tempo gasto', () => {
    expect(
      estadoDaPratica([0, 1], [r(0, true, false, 0, 20), r(1, true, false, 0, 5)]).segundos,
    ).toBe(25);
  });
});

describe('apresentar', () => {
  const base = { conceitos: ['a'], explicacao: 'e', fonte: { descricao: 'Lorem Ipsum, cap. 1' } };
  it('verdadeiro ou falso vira duas opções grandes', () => {
    const v = apresentar({ tipo: 'verdadeiro_falso', ...base, afirmacao: 'x', correta: false });
    expect(v).toMatchObject({ opcoes: ['Verdadeiro', 'Falso'], correta: 1, grandes: true });
  });
  it('usa o título curto quando existe', () => {
    const m: Exercicio = {
      tipo: 'multipla_escolha',
      ...base,
      titulo_curto: 'Curto',
      pergunta: 'p',
      opcoes: ['a', 'b', 'c'],
      correta: 0,
    };
    expect(apresentar(m)?.rotulo).toBe('Curto');
  });
  it('tipos sem tela ainda devolvem null', () => {
    const o: Exercicio = { tipo: 'ordenar', ...base, pergunta: 'p', etapas: ['a', 'b', 'c'] };
    expect(apresentar(o)).toBeNull();
  });
});

describe('formatarTempo', () => {
  it('formata segundos e minutos', () => {
    expect(formatarTempo(45)).toBe('45 s');
    expect(formatarTempo(120)).toBe('2 min');
    expect(formatarTempo(125)).toBe('2 min 5 s');
  });
});
