import { describe, expect, it } from 'vitest';
import {
  ofensivaAtual,
  ofensivaEmRisco,
  registrarDiaEstudado,
  registrarEstudo,
  ultimosSeteDias,
} from './ofensiva.ts';

const vazia = { atual: 0, recorde: 0, ultimoDia: null };

describe('ofensiva', () => {
  it('o primeiro dia de estudo começa em 1', () => {
    expect(registrarEstudo(vazia, '2026-10-28')).toEqual({
      atual: 1,
      recorde: 1,
      ultimoDia: '2026-10-28',
    });
  });

  it('dois dias seguidos somam; estudar de novo no mesmo dia não soma', () => {
    const a = registrarEstudo(vazia, '2026-10-27');
    const b = registrarEstudo(a, '2026-10-28');
    expect(b.atual).toBe(2);
    expect(registrarEstudo(b, '2026-10-28')).toBe(b);
  });

  it('pular um dia recomeça em 1, mas o recorde fica', () => {
    const sete = { atual: 7, recorde: 7, ultimoDia: '2026-10-25' };
    const r = registrarEstudo(sete, '2026-10-27');
    expect(r).toEqual({ atual: 1, recorde: 7, ultimoDia: '2026-10-27' });
  });

  it('o recorde sobe junto com a ofensiva', () => {
    const o = { atual: 12, recorde: 12, ultimoDia: '2026-10-27' };
    expect(registrarEstudo(o, '2026-10-28')).toMatchObject({ atual: 13, recorde: 13 });
  });

  it('virada de dia: às 23:59 ainda é o mesmo dia, à 00:00 soma', () => {
    const o = registrarEstudo(vazia, '2026-10-27');
    expect(registrarEstudo(o, '2026-10-27').atual).toBe(1);
    expect(registrarEstudo(o, '2026-10-28').atual).toBe(2);
  });

  it('mudança de fuso: o relógio voltar um dia não zera nem conta duas vezes', () => {
    const o = { atual: 5, recorde: 8, ultimoDia: '2026-10-29' };
    expect(registrarEstudo(o, '2026-10-28')).toBe(o);
    expect(ofensivaAtual(o, '2026-10-28')).toBe(5);
  });

  it('o número exibido vira 0 só depois de um dia inteiro sem estudar', () => {
    const o = { atual: 7, recorde: 12, ultimoDia: '2026-10-28' };
    expect(ofensivaAtual(o, '2026-10-28')).toBe(7);
    expect(ofensivaAtual(o, '2026-10-29')).toBe(7);
    expect(ofensivaAtual(o, '2026-10-30')).toBe(0);
    expect(ofensivaAtual(vazia, '2026-10-30')).toBe(0);
  });

  it('em risco: estudou ontem, ainda não hoje', () => {
    const o = { atual: 3, recorde: 3, ultimoDia: '2026-10-28' };
    expect(ofensivaEmRisco(o, '2026-10-28')).toBe(false);
    expect(ofensivaEmRisco(o, '2026-10-29')).toBe(true);
    expect(ofensivaEmRisco(o, '2026-10-30')).toBe(false);
  });

  it('guarda só os últimos 30 dias, sem repetir e em ordem', () => {
    const dias = ['2026-09-01', '2026-10-20', '2026-10-27'];
    const r = registrarDiaEstudado(dias, '2026-10-28', '2026-10-28');
    expect(r).toEqual(['2026-10-20', '2026-10-27', '2026-10-28']);
    expect(registrarDiaEstudado(r, '2026-10-28', '2026-10-28')).toEqual(r);
  });

  it('marca os 7 dias que terminam hoje', () => {
    const r = ultimosSeteDias(['2026-10-26', '2026-10-28'], '2026-10-28');
    expect(r).toHaveLength(7);
    expect(r[0]?.dia).toBe('2026-10-22');
    expect(r.filter((x) => x.estudou).map((x) => x.dia)).toEqual(['2026-10-26', '2026-10-28']);
  });
});
