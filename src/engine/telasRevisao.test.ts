import { describe, expect, it } from 'vitest';
import { PERFIS } from '../dev/perfis.ts';
import type { Caderno } from '../storage/estado.ts';
import { catalogoLorem } from '../testes/catalogo.ts';
import { novaEntrada } from './revisao.ts';
import {
  conceitosDoTreino,
  cursosDoCaderno,
  dadosDaRevisao,
  filtrarCaderno,
  itensDoCaderno,
  minutosDaRevisao,
  normalizar,
  proximasRevisoesAgrupadas,
  rotuloDaForca,
  voltaEm,
} from './telasRevisao.ts';

const catalogo = catalogoLorem();
const HOJE = '2026-10-28'; // quarta-feira
const perfil = (id: string) => {
  const p = PERFIS.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p.construir(catalogo, HOJE).caderno;
};
const entrada = (id: string, proxima: string): Caderno[string] => ({
  ...novaEntrada(id, 'comece-por-aqui/lorem-unidade-um/lorem-licao-modelo', '2026-10-20'),
  proximaRevisao: proxima,
});

describe('textos', () => {
  it('nomeia as forças e os prazos', () => {
    expect(rotuloDaForca(1)).toBe('Fraco');
    expect(rotuloDaForca(5)).toBe('Dominado');
    expect(voltaEm(1)).toBe('amanhã');
    expect(voltaEm(7)).toBe('em 7 dias');
  });
  it('normaliza acentos e maiúsculas', () => {
    expect(normalizar('  Separação dos PODERES ')).toBe('separacao dos poderes');
  });
});

describe('Caderno', () => {
  const caderno = perfil('em-andamento');
  const itens = itensDoCaderno(caderno, catalogo);

  it('lista os conceitos aprendidos com curso, lição e destino', () => {
    expect(itens.length).toBe(Object.keys(caderno).length);
    expect(itens[0]).toMatchObject({ cursoTitulo: expect.any(String) });
    expect(itens[0]?.licaoDestino).toMatch(/^\/c\/[^/]+\/[^/]+\/[^/]+$/);
    const nomes = itens.map((i) => i.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  });
  it('ignora conceito que não existe mais no catálogo', () => {
    const com = { ...caderno, fantasma: entrada('fantasma', '2026-10-30') };
    expect(itensDoCaderno(com, catalogo)).toHaveLength(itens.length);
  });
  it('a busca ignora acento e maiúscula e o filtro por curso funciona junto', () => {
    const primeiro = itens[0];
    if (!primeiro) throw new Error('sem itens');
    const busca = primeiro.nome.toUpperCase();
    expect(filtrarCaderno(itens, busca, null).map((i) => i.id)).toContain(primeiro.id);
    expect(filtrarCaderno(itens, busca, 'curso-que-nao-existe')).toEqual([]);
    expect(filtrarCaderno(itens, 'zzzz sem resultado', null)).toEqual([]);
    expect(
      filtrarCaderno(itens, '', primeiro.cursoId).every((i) => i.cursoId === primeiro.cursoId),
    ).toBe(true);
  });
  it('lista só os cursos que têm conceito', () => {
    const cursos = cursosDoCaderno(itens, catalogo);
    expect(cursos.map((c) => c.id)).toEqual(
      catalogo.cursos.map((c) => c.id).filter((id) => itens.some((i) => i.cursoId === id)),
    );
  });
});

describe('Revisar', () => {
  it('conta os vencidos e mostra os da sessão de hoje', () => {
    const d = dadosDaRevisao(perfil('em-andamento'), catalogo, HOJE);
    expect(d.total).toBe(6);
    expect(d.sessao).toHaveLength(6);
    expect(d.sessao[0]).toMatchObject({ vistoHa: expect.stringMatching(/^(hoje|há )/) });
    expect(d.cursosVindos).toBeGreaterThanOrEqual(1);
    expect(d.minutos).toBe(4);
    expect(d.temCaderno).toBe(true);
  });
  it('com tudo em dia não há vencidos e diz quando o próximo vence', () => {
    const d = dadosDaRevisao(perfil('tudo-em-dia'), catalogo, HOJE);
    expect(d.total).toBe(0);
    expect(d.sessao).toEqual([]);
    expect(d.proximoEmDias).toBeGreaterThanOrEqual(1);
    expect(d.proximas.length).toBeGreaterThan(0);
  });
  it('sem caderno nada é calculado', () => {
    const d = dadosDaRevisao({}, catalogo, HOJE);
    expect(d).toMatchObject({ total: 0, temCaderno: false, proximoEmDias: null });
    expect(d.cursosDeTreino).toEqual([]);
  });
  it('limita a sessão a 10 conceitos, mas o total conta todos', () => {
    const caderno: Caderno = {};
    const ids = Object.keys(catalogo.conceitos).slice(0, 12);
    ids.forEach((id, i) => {
      caderno[id] = entrada(id, `2026-10-${String(10 + i).padStart(2, '0')}`);
    });
    const d = dadosDaRevisao(caderno, catalogo, HOJE);
    expect(d.total).toBe(ids.length);
    expect(d.sessao).toHaveLength(Math.min(10, ids.length));
  });
  it('estima cerca de 40 segundos por conceito', () => {
    expect(minutosDaRevisao(1)).toBe(1);
    expect(minutosDaRevisao(6)).toBe(4);
    expect(minutosDaRevisao(10)).toBe(7);
  });
});

describe('próximas revisões', () => {
  it('agrupa em Amanhã, dia da semana, Semana que vem e Mais adiante', () => {
    const caderno: Caderno = {
      a: entrada('a', '2026-10-29'), // amanhã (quinta)
      b: entrada('b', '2026-10-29'),
      c: entrada('c', '2026-10-31'), // sábado
      d: entrada('d', '2026-11-04'), // 7 dias
      e: entrada('e', '2026-11-08'), // 11 dias
      f: entrada('f', '2026-12-01'), // mais adiante
      g: entrada('g', '2026-10-27'), // vencido: não entra
    };
    expect(proximasRevisoesAgrupadas(caderno, HOJE)).toEqual([
      { rotulo: 'Amanhã', quantidade: 2 },
      { rotulo: 'Sábado', quantidade: 1 },
      { rotulo: 'Semana que vem', quantidade: 2 },
      { rotulo: 'Mais adiante', quantidade: 1 },
    ]);
  });
});

describe('treino livre', () => {
  it('pega os conceitos mais fracos do curso, até 10, vencidos ou não', () => {
    const caderno = perfil('tudo-em-dia');
    const curso = catalogo.cursos[0];
    if (!curso) throw new Error('sem curso');
    const ids = conceitosDoTreino(caderno, catalogo, curso.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(10);
    const caixas = ids.map((id) => caderno[id]?.caixa ?? 0);
    expect(caixas).toEqual([...caixas].sort((a, b) => a - b));
  });
});
