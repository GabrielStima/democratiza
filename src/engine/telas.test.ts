import { describe, expect, it } from 'vitest';
import { PERFIS } from '../dev/perfis.ts';
import { catalogoLorem } from '../testes/catalogo.ts';
import { dadosDaHome, dadosDoCurso, ondeAprender, primeiraLicaoDoSite } from './telas.ts';

const catalogo = catalogoLorem();
const HOJE = '2026-10-28';
const perfil = (id: string) => {
  const p = PERFIS.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p.construir(catalogo, HOJE);
};
const home = (id: string) => {
  const { estado, caderno } = perfil(id);
  if (!estado) throw new Error('sem estado');
  return dadosDaHome(estado, caderno, catalogo, HOJE);
};

describe('dadosDaHome', () => {
  it('"Um curso só" usa a variante de um curso e não libera outros cursos', () => {
    const d = home('um-curso-so');
    expect(d.umCursoSo).toBe(true);
    expect(d.cursos[0]?.progresso).toMatchObject({ feitas: 3, total: 8 });
    expect(d.explorar.every((c) => !c.liberado)).toBe(true);
    expect(d.ofensiva.dias).toBe(3);
  });
  it('"Em andamento" lista dois cursos, a meta e os conceitos vencidos', () => {
    const d = home('em-andamento');
    expect(d.umCursoSo).toBe(false);
    expect(d.cursos).toHaveLength(2);
    expect(d.cursos.filter((c) => c.emDestaque)).toHaveLength(1);
    expect(d.ofensiva).toMatchObject({ dias: 7, recorde: 12, emRisco: false });
    expect(d.meta).toMatchObject({ xp: 30, meta: 50, atingida: false });
    expect(d.revisao.vencidos).toBe(6);
    expect(d.continuar?.emAndamento).toBe(true);
  });
  it('"Tudo em dia" não tem conceitos vencidos', () => {
    expect(home('tudo-em-dia').revisao.vencidos).toBe(0);
  });
  it('"Curso 1 completo" mostra o curso 2 como liberado e o 3 como bloqueado', () => {
    const d = home('curso-1-completo');
    const [c2, c3] = [
      d.explorar.find((c) => c.id === 'aprofundamento-lorem'),
      d.explorar.find((c) => c.id === 'modulo-lorem'),
    ];
    expect(c2?.liberado).toBe(true);
    expect(c3?.liberado).toBe(false);
    expect(c3?.faltantes.length).toBeGreaterThan(0);
    expect(c3?.faltantes[0]?.cursoTitulo).toBeTruthy();
  });
  it('o cartão Continuar diz a posição na unidade e o tempo estimado', () => {
    const c = home('um-curso-so').continuar;
    expect(c).toMatchObject({ unidade: 2, numero: 1 });
    expect(c?.minutos).toBeGreaterThanOrEqual(1);
  });
});

describe('dadosDoCurso', () => {
  const curso1 = catalogo.cursos[0]!;
  it('visitante: a primeira lição é a "atual" e o resto está bloqueado', () => {
    const d = dadosDoCurso(curso1, null, {}, catalogo);
    expect(d.unidades[0]?.licoes.map((l) => l.estado)).toEqual(['atual', 'bloqueada', 'bloqueada']);
    expect(d.unidades[1]?.status).toBe('bloqueada');
    expect(d.unidades[1]?.aviso).toBe('Libera ao terminar a Unidade 1');
    expect(d.continuar).toMatchObject({ rotulo: 'Começar' });
  });
  it('"Um curso só": três lições feitas e Continuar na quarta', () => {
    const { estado, caderno } = perfil('um-curso-so');
    const d = dadosDoCurso(curso1, estado, caderno, catalogo);
    expect(d.progresso).toMatchObject({ feitas: 3, total: 8 });
    expect(d.unidades.flatMap((u) => u.licoes).filter((l) => l.estado === 'feita')).toHaveLength(3);
    expect(d.continuar?.rotulo).toBe('Continuar');
    expect(d.conceitos.aprendidos).toBeGreaterThan(0);
  });
  it('lição de desafio não lista conceitos', () => {
    const d = dadosDoCurso(curso1, null, {}, catalogo);
    const desafio = d.unidades[0]?.licoes.find((l) => l.desafio);
    expect(desafio?.conceitos).toEqual([]);
  });
  it('curso bloqueado mostra o que falta e não tem Continuar', () => {
    const curso3 = catalogo.cursos[2]!;
    const d = dadosDoCurso(curso3, null, {}, catalogo);
    expect(d.liberado).toBe(false);
    expect(d.continuar).toBeNull();
    expect(d.faltantes.length).toBeGreaterThan(0);
  });
  it('"O que este curso libera" vem do grafo de conceitos', () => {
    expect(dadosDoCurso(curso1, null, {}, catalogo).libera.map((c) => c.id)).toContain(
      'aprofundamento-lorem',
    );
  });
});

describe('primeiraLicaoDoSite', () => {
  it('é a primeira lição do primeiro curso', () => {
    expect(primeiraLicaoDoSite(catalogo)).toBe(
      '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo',
    );
    expect(primeiraLicaoDoSite({ ...catalogo, cursos: [] })).toBeNull();
  });
});

describe('ondeAprender', () => {
  it('diz em que curso se aprendem os conceitos que faltam', () => {
    const c = (cursoTitulo?: string) => (cursoTitulo ? { cursoTitulo } : {});
    expect(ondeAprender([c('Sistema')])).toBe('Você aprende esse conceito em “Sistema”.');
    expect(ondeAprender([c('Sistema'), c('Sistema')])).toBe('Você aprende os dois em “Sistema”.');
    expect(ondeAprender([c('A'), c('A'), c('A')])).toBe('Você aprende todos em “A”.');
    expect(ondeAprender([c('A'), c('B')])).toBe('Você aprende em “A” e “B”.');
    expect(ondeAprender([c()])).toBe('');
  });
  it('a Home guarda quantos cursos têm conceito vencido e o título da unidade', () => {
    const d = home('em-andamento');
    expect(d.revisao.cursos).toBeGreaterThanOrEqual(1);
    expect(d.continuar?.unidadeTitulo).toBeTruthy();
  });
});
