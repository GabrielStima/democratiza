import { describe, expect, it } from 'vitest';
import { catalogoLorem, estadoDeTeste } from '../testes/catalogo.ts';
import { licaoParaContinuar } from './continuar.ts';
import {
  conceitosDoCurso,
  listarLicoes,
  minutosEstimados,
  partirIdLicao,
  progressoDaUnidade,
  progressoDoCurso,
  proximaLicao,
} from './progresso.ts';
import { novaEntrada } from './revisao.ts';

const catalogo = catalogoLorem();
const curso1 = catalogo.cursos[0]!;
const feita = { acertos: 3, total: 3, em: '2026-10-28' };
const feitasAte = (n: number) =>
  Object.fromEntries(
    listarLicoes(curso1)
      .slice(0, n)
      .map((l) => [l.id, feita]),
  );

describe('progresso', () => {
  it('o curso 1 Lorem tem 3 unidades e 8 lições na ordem das pastas', () => {
    const l = listarLicoes(curso1);
    expect(curso1.unidades).toHaveLength(3);
    expect(l).toHaveLength(8);
    expect(l[0]?.licaoId).toBe('lorem-licao-modelo');
  });

  it('calcula feitas, percentual e unidade atual', () => {
    expect(progressoDoCurso(curso1, {})).toMatchObject({
      feitas: 0,
      total: 8,
      percentual: 0,
      unidadeAtual: 1,
    });
    expect(progressoDoCurso(curso1, feitasAte(4))).toMatchObject({
      feitas: 4,
      percentual: 50,
      unidadeAtual: 2,
    });
    const tudo = progressoDoCurso(curso1, feitasAte(8));
    expect(tudo).toMatchObject({ concluido: true, unidadeAtual: null, percentual: 100 });
  });

  it('progresso por unidade', () => {
    expect(progressoDaUnidade(curso1, curso1.unidades[0]!.id, feitasAte(2))).toEqual({
      feitas: 2,
      total: 3,
    });
  });

  it('a próxima lição é a primeira que falta', () => {
    expect(proximaLicao(curso1, feitasAte(2))?.licaoId).toBe('lorem-desafio-um');
    expect(proximaLicao(curso1, feitasAte(8))).toBeNull();
  });

  it('conta os conceitos do curso que já estão no caderno', () => {
    const caderno = { 'lorem-01': novaEntrada('lorem-01', 'l', '2026-10-01') };
    expect(conceitosDoCurso(curso1, caderno)).toEqual({ aprendidos: 1, total: 12 });
  });

  it('estimativa: 1 min por card + 30 s por exercício, arredondado para cima', () => {
    expect(minutosEstimados(2, 6)).toBe(5);
    expect(minutosEstimados(1, 3)).toBe(3);
    expect(minutosEstimados(0, 1)).toBe(1);
  });

  it('separa o id completo da lição', () => {
    expect(partirIdLicao('a/b/c')).toEqual({ cursoId: 'a', unidadeId: 'b', licaoId: 'c' });
    expect(partirIdLicao('a/b')).toBeNull();
  });
});

describe('o que o botão Continuar abre', () => {
  const base = estadoDeTeste('2026-10-28');

  it('sem progresso: a primeira lição do primeiro curso liberado', () => {
    expect(licaoParaContinuar(base, catalogo, {})?.licaoId).toBe('lorem-licao-modelo');
  });

  it('com lição em andamento: ela mesma', () => {
    const id = listarLicoes(curso1)[1]!.id;
    const r = licaoParaContinuar(
      { ...base, licaoEmAndamento: { id, etapa: 'explicacao', card: 1 } },
      catalogo,
      {},
    );
    expect(r).toMatchObject({ id, emAndamento: true });
  });

  it('sem lição em andamento: a próxima do curso atual', () => {
    const r = licaoParaContinuar(
      { ...base, cursoAtual: curso1.id, licoesConcluidas: feitasAte(2) },
      catalogo,
      {},
    );
    expect(r).toMatchObject({ licaoId: 'lorem-desafio-um', emAndamento: false });
  });

  it('curso terminado: vai para outro curso liberado; sem nenhum, devolve null', () => {
    const caderno = Object.fromEntries(
      curso1.ensina.map((id) => [id, novaEntrada(id, 'l', '2026-10-01')]),
    );
    const terminado = { ...base, cursoAtual: curso1.id, licoesConcluidas: feitasAte(8) };
    expect(licaoParaContinuar(terminado, catalogo, caderno)?.cursoId).toBe('aprofundamento-lorem');
    expect(licaoParaContinuar(terminado, catalogo, {})).toBeNull();
  });
});
