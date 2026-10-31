import { describe, expect, it } from 'vitest';
import { PERFIS } from '../dev/perfis.ts';
import { catalogoLorem } from '../testes/catalogo.ts';
import { dadosDosCursos, filtrarCursos, resumoDoCurso } from './telasCursos.ts';

const catalogo = catalogoLorem();
const HOJE = '2026-10-28';
const perfil = (id: string) => {
  const p = PERFIS.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p.construir(catalogo, HOJE);
};
const estados = (id: string | null) => {
  const p = id ? perfil(id) : null;
  const niveis = dadosDosCursos(p?.estado ?? null, p?.caderno ?? {}, catalogo);
  return Object.fromEntries(niveis.flatMap((n) => n.cursos).map((c) => [c.id, c.estado]));
};

describe('dadosDosCursos', () => {
  it('agrupa nos três níveis, na ordem', () => {
    const n = dadosDosCursos(null, {}, catalogo);
    expect(n.map((x) => x.nome)).toEqual(['Introdução', 'Aprofundamentos', 'Módulos']);
    expect(n.map((x) => x.cursos.length)).toEqual([1, 1, 1]);
  });
  it('visitante: só a Introdução está liberada', () => {
    expect(estados(null)).toEqual({
      'comece-por-aqui': 'liberado',
      'aprofundamento-lorem': 'bloqueado',
      'modulo-lorem': 'bloqueado',
    });
  });
  it('"Um curso só": o curso 1 em andamento e os outros bloqueados', () => {
    const e = estados('um-curso-so');
    expect(e['comece-por-aqui']).toBe('andamento');
    expect(e['aprofundamento-lorem']).toBe('bloqueado');
  });
  it('"Curso 1 completo": concluído, curso 2 liberado e curso 3 bloqueado', () => {
    expect(estados('curso-1-completo')).toMatchObject({
      'comece-por-aqui': 'concluido',
      'aprofundamento-lorem': 'liberado',
      'modulo-lorem': 'bloqueado',
    });
  });
  it('o curso bloqueado lista o que falta e onde se aprende', () => {
    const p = perfil('curso-1-completo');
    const c = dadosDosCursos(p.estado, p.caderno, catalogo)
      .flatMap((n) => n.cursos)
      .find((x) => x.id === 'modulo-lorem');
    expect(c?.faltantes.length).toBeGreaterThan(0);
    expect(c?.ondeAprende).toMatch(/^Você aprende/);
  });
  it('só o curso bloqueado tem faltantes; o percentual vem das lições feitas', () => {
    const p = perfil('um-curso-so');
    const todos = dadosDosCursos(p.estado, p.caderno, catalogo).flatMap((n) => n.cursos);
    expect(todos.find((c) => c.id === 'comece-por-aqui')).toMatchObject({
      faltantes: [],
      percentual: 38,
    });
  });
});

describe('filtrarCursos', () => {
  const todos = dadosDosCursos(null, {}, catalogo);
  it('sem busca devolve tudo', () => {
    expect(filtrarCursos(todos, '  ')).toEqual(todos);
  });
  it('ignora acento e maiúscula e some com os níveis vazios', () => {
    const r = filtrarCursos(todos, 'COMEÇE');
    expect(r).toHaveLength(1);
    expect(r[0]?.cursos[0]?.id).toBe('comece-por-aqui');
    expect(filtrarCursos(todos, 'comece')).toEqual(r);
  });
  it('sem resultado devolve lista vazia', () => {
    expect(filtrarCursos(todos, 'zzzz')).toEqual([]);
  });
});

describe('resumoDoCurso', () => {
  it('usa singular e plural', () => {
    expect(resumoDoCurso({ nUnidades: 4, nLicoes: 20, nConceitos: 22 })).toBe(
      '4 unidades · 20 lições · 22 conceitos',
    );
    expect(resumoDoCurso({ nUnidades: 1, nLicoes: 1, nConceitos: 1 })).toBe(
      '1 unidade · 1 lição · 1 conceito',
    );
  });
});
