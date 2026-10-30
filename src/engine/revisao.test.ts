import { describe, expect, it } from 'vitest';
import type { Caderno } from '../storage/estado.ts';
import {
  aplicarRevisao,
  conceitosVencidos,
  MAX_SESSAO,
  novaEntrada,
  proximasRevisoes,
  registrarResultado,
  selecionarSessao,
} from './revisao.ts';

describe('revisão espaçada (Leitner)', () => {
  it('conceito novo entra na caixa 1 e volta amanhã', () => {
    expect(novaEntrada('a', 'c/u/l', '2026-10-28')).toEqual({
      conceitoId: 'a',
      caixa: 1,
      proximaRevisao: '2026-10-29',
      ultimaRevisao: null,
      aprendidoEm: '2026-10-28',
      licaoId: 'c/u/l',
    });
  });

  it('acertar sobe uma caixa de cada vez, de 1 até 5', () => {
    let e = novaEntrada('a', 'l', '2026-10-01');
    const caixas = [1, 2, 3, 4].map(() => {
      e = registrarResultado(e, true, '2026-10-01');
      return e.caixa;
    });
    expect(caixas).toEqual([2, 3, 4, 5]);
  });

  it('as datas seguem 1, 3, 7, 15 e 30 dias', () => {
    const dia = '2026-10-01';
    let e = novaEntrada('a', 'l', dia);
    expect(e.proximaRevisao).toBe('2026-10-02');
    e = registrarResultado(e, true, dia);
    expect(e.proximaRevisao).toBe('2026-10-04');
    e = registrarResultado(e, true, dia);
    expect(e.proximaRevisao).toBe('2026-10-08');
    e = registrarResultado(e, true, dia);
    expect(e.proximaRevisao).toBe('2026-10-16');
    e = registrarResultado(e, true, dia);
    expect(e.proximaRevisao).toBe('2026-10-31');
  });

  it('o teto é a caixa 5', () => {
    const e = { ...novaEntrada('a', 'l', '2026-10-01'), caixa: 5 };
    const r = registrarResultado(e, true, '2026-10-02');
    expect(r.caixa).toBe(5);
    expect(r.proximaRevisao).toBe('2026-11-01');
  });

  it('errar volta para a caixa 1, vence amanhã e guarda a última revisão', () => {
    const e = { ...novaEntrada('a', 'l', '2026-10-01'), caixa: 4 };
    const r = registrarResultado(e, false, '2026-10-20');
    expect(r).toMatchObject({
      caixa: 1,
      proximaRevisao: '2026-10-21',
      ultimaRevisao: '2026-10-20',
    });
  });

  const caderno: Caderno = {
    a: { ...novaEntrada('a', 'l', '2026-10-20'), proximaRevisao: '2026-10-27' },
    b: { ...novaEntrada('b', 'l', '2026-10-20'), proximaRevisao: '2026-10-28' },
    c: { ...novaEntrada('c', 'l', '2026-10-20'), proximaRevisao: '2026-10-29' },
    d: { ...novaEntrada('d', 'l', '2026-10-20'), proximaRevisao: '2026-10-31' },
  };

  it('vence no dia marcado ou depois; o mais atrasado vem primeiro', () => {
    expect(conceitosVencidos(caderno, '2026-10-28').map((e) => e.conceitoId)).toEqual(['a', 'b']);
    expect(conceitosVencidos(caderno, '2026-10-27').map((e) => e.conceitoId)).toEqual(['a']);
    expect(conceitosVencidos(caderno, '2026-10-26')).toEqual([]);
  });

  it('a sessão tem no máximo 10 conceitos', () => {
    const grande: Caderno = {};
    for (let i = 0; i < 15; i++) {
      const id = `c${String(i).padStart(2, '0')}`;
      grande[id] = { ...novaEntrada(id, 'l', '2026-10-01'), proximaRevisao: '2026-10-10' };
    }
    expect(selecionarSessao(grande, '2026-10-28')).toHaveLength(MAX_SESSAO);
  });

  it('lista as próximas revisões por dia, só dias futuros', () => {
    expect(proximasRevisoes(caderno, '2026-10-28')).toEqual([
      { dia: '2026-10-29', quantidade: 1 },
      { dia: '2026-10-31', quantidade: 1 },
    ]);
  });

  it('aplica os resultados da sessão', () => {
    const r = aplicarRevisao(
      caderno,
      [
        { conceitoId: 'a', acertou: true },
        { conceitoId: 'b', acertou: false },
      ],
      '2026-10-28',
      'revisao',
    );
    expect(r['a']?.caixa).toBe(2);
    expect(r['b']?.caixa).toBe(1);
    expect(r['c']).toBe(caderno['c']);
  });

  it('treino livre não mexe nas caixas nem nas datas', () => {
    const r = aplicarRevisao(
      caderno,
      [{ conceitoId: 'a', acertou: false }],
      '2026-10-28',
      'treino',
    );
    expect(r).toBe(caderno);
  });
});
