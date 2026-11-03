import { describe, expect, it } from 'vitest';
import { catalogoLorem } from '../testes/catalogo.ts';
import {
  escolherExercicio,
  exerciciosDoConceito,
  licoesDoConceito,
  type LicaoCarregada,
} from './montar.ts';
import modelo from '../../content/cursos/01-comece-por-aqui/01-lorem-unidade-um/01-lorem-licao-modelo.json';
import modeloDois from '../../content/cursos/02-aprofundamento-lorem/01-lorem-aprofundamento-um/01-lorem-licao-modelo-dois.json';
import type { Licao } from '../content-schema/licao.ts';

const catalogo = catalogoLorem();
const ID = 'comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';
const licoes: LicaoCarregada[] = [{ id: ID, licao: modelo as unknown as Licao }];

describe('licoesDoConceito', () => {
  it('põe a lição em que a pessoa aprendeu na frente', () => {
    const todas = licoesDoConceito(catalogo, 'lorem-01');
    expect(todas.length).toBeGreaterThan(0);
    const outra = todas[todas.length - 1] as string;
    expect(licoesDoConceito(catalogo, 'lorem-01', outra)[0]).toBe(outra);
  });
  it('conceito desconhecido não tem lições', () => {
    expect(licoesDoConceito(catalogo, 'nao-existe')).toEqual([]);
  });
});

describe('escolherExercicio', () => {
  it('devolve uma pergunta que pratica o conceito e tem tela', () => {
    const item = escolherExercicio('lorem-01', licoes, '2026-10-28');
    expect(item?.ex.conceitos).toContain('lorem-01');
    expect(item?.apresentacao.forma).toBeDefined();
  });
  it('é estável no mesmo dia', () => {
    const a = escolherExercicio('lorem-02', licoes, '2026-10-28');
    const b = escolherExercicio('lorem-02', licoes, '2026-10-28');
    expect(a?.ex).toBe(b?.ex);
  });
  it('devolve nulo quando nenhum exercício pratica o conceito', () => {
    expect(escolherExercicio('lorem-18', licoes, '2026-10-28')).toBeNull();
  });
});

describe('os tipos novos entram na seleção da Revisão', () => {
  const dois: LicaoCarregada[] = [
    {
      id: 'aprofundamento-lorem/lorem-aprofundamento-um/lorem-licao-modelo-dois',
      licao: modeloDois as unknown as Licao,
    },
  ];
  it('classificar, ordenar e mito ou fato aparecem entre as perguntas dos conceitos', () => {
    const formas = ['lorem-13', 'lorem-14'].flatMap((c) =>
      exerciciosDoConceito(c, dois).map((i) => `${i.ex.tipo}:${i.apresentacao.forma}`),
    );
    expect(formas).toContain('classificar:classificar');
    expect(formas).toContain('ordenar:ordenar');
    expect(formas).toContain('mito_ou_fato:opcoes');
  });
});

describe('exerciciosDoConceito', () => {
  it('traz até 5 exercícios do conceito', () => {
    const itens = exerciciosDoConceito('lorem-01', licoes);
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.length).toBeLessThanOrEqual(5);
    expect(itens.every((i) => i.ex.conceitos.includes('lorem-01'))).toBe(true);
  });
});
