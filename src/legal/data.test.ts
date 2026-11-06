import { describe, expect, it } from 'vitest';
import { dataPorExtenso } from './data.ts';

describe('dataPorExtenso', () => {
  it('escreve a data em português', () => {
    expect(dataPorExtenso('2026-11-06')).toBe('6 de novembro de 2026');
    expect(dataPorExtenso('2027-03-01')).toBe('1 de março de 2027');
  });
  it('devolve o texto original se não for uma data', () => {
    expect(dataPorExtenso('ontem')).toBe('ontem');
  });
});
