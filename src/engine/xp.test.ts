import { describe, expect, it } from 'vitest';
import { estadoDeTeste } from '../testes/catalogo.ts';
import { adicionarXp, metaAtingida, xpDaLicao, xpDeHoje, xpDoAcerto } from './xp.ts';

describe('xp', () => {
  it('acerto de primeira vale 10; depois de errar vale 5', () => {
    expect(xpDoAcerto(true)).toBe(10);
    expect(xpDoAcerto(false)).toBe(5);
  });

  it('5 acertos de primeira e 1 depois de errar somam 55', () => {
    const total = 5 * xpDoAcerto(true) + xpDoAcerto(false);
    expect(total).toBe(55);
  });

  it('soma no total e no do dia', () => {
    const e = adicionarXp(estadoDeTeste('2026-10-28'), 30, '2026-10-28');
    expect(e.xp).toBe(30);
    expect(e.xpHoje).toEqual({ dia: '2026-10-28', valor: 30 });
    expect(adicionarXp(e, 20, '2026-10-28').xpHoje.valor).toBe(50);
  });

  it('o XP de hoje zera na virada do dia, o total não', () => {
    const e = adicionarXp(estadoDeTeste('2026-10-28'), 30, '2026-10-28');
    expect(xpDeHoje(e, '2026-10-29')).toBe(0);
    const amanha = adicionarXp(e, 10, '2026-10-29');
    expect(amanha.xp).toBe(40);
    expect(amanha.xpHoje).toEqual({ dia: '2026-10-29', valor: 10 });
  });

  it('a meta diária é atingida ao chegar em 20, 50 ou 100', () => {
    const base = estadoDeTeste('2026-10-28');
    const e = {
      ...adicionarXp(base, 49, '2026-10-28'),
      config: { ...base.config, metaDiaria: 50 as const },
    };
    expect(metaAtingida(e, '2026-10-28')).toBe(false);
    expect(metaAtingida(adicionarXp(e, 1, '2026-10-28'), '2026-10-28')).toBe(true);
    expect(metaAtingida(adicionarXp(e, 1, '2026-10-28'), '2026-10-29')).toBe(false);
  });

  it('lição refeita não dá XP', () => {
    expect(xpDaLicao(false, 55)).toBe(55);
    expect(xpDaLicao(true, 55)).toBe(0);
  });
});
