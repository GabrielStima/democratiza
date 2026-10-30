import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { novaEntrada } from '../engine/revisao.ts';
import { armazemIndexedDb, armazemMemoria, diferencas, paraCaderno } from './caderno.ts';

const a = novaEntrada('a', 'c/u/l', '2026-10-01');
const b = novaEntrada('b', 'c/u/l', '2026-10-01');

describe.each([
  ['memória', () => armazemMemoria()],
  ['IndexedDB', () => armazemIndexedDb()],
])('armazém do caderno (%s)', (_nome, criar) => {
  const arm = criar();
  beforeEach(() => arm.limpar());

  it('guarda, atualiza e lê as entradas', async () => {
    await arm.salvar([a, b]);
    await arm.salvar([{ ...a, caixa: 3 }]);
    const todas = paraCaderno(await arm.carregar());
    expect(Object.keys(todas).sort()).toEqual(['a', 'b']);
    expect(todas['a']?.caixa).toBe(3);
  });

  it('remove e limpa', async () => {
    await arm.salvar([a, b]);
    await arm.remover(['a']);
    expect((await arm.carregar()).map((e) => e.conceitoId)).toEqual(['b']);
    await arm.limpar();
    expect(await arm.carregar()).toEqual([]);
  });
});

describe('IndexedDB', () => {
  it('ignora entradas inválidas em vez de quebrar', async () => {
    const arm = armazemIndexedDb();
    await arm.limpar();
    await arm.salvar([a, { ...b, caixa: 9 }]);
    expect((await arm.carregar()).map((e) => e.conceitoId)).toEqual(['a']);
  });
});

describe('diferenças entre cadernos', () => {
  it('só grava o que mudou e remove o que saiu', () => {
    const antes = { a, b };
    const depois = { a, c: novaEntrada('c', 'l', '2026-10-02'), b: { ...b, caixa: 2 } };
    const { salvar, remover } = diferencas(antes, depois);
    expect(salvar.map((e) => e.conceitoId).sort()).toEqual(['b', 'c']);
    expect(remover).toEqual([]);
    expect(diferencas(antes, { a }).remover).toEqual(['b']);
  });
});
