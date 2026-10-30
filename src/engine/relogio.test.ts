import { afterEach, describe, expect, it } from 'vitest';
import {
  agora,
  definirDeslocamento,
  diaDe,
  diasEntre,
  hoje,
  somarDias,
  usarRelogio,
} from './relogio.ts';

afterEach(() => {
  usarRelogio();
  definirDeslocamento(0);
});

describe('relógio', () => {
  it('o dia vira à meia-noite local', () => {
    usarRelogio(() => new Date(2026, 9, 28, 23, 59, 59));
    expect(hoje()).toBe('2026-10-28');
    usarRelogio(() => new Date(2026, 9, 29, 0, 0, 0));
    expect(hoje()).toBe('2026-10-29');
  });

  it('o mesmo instante cai em dias diferentes conforme o fuso', () => {
    const instante = new Date(Date.UTC(2026, 9, 28, 23, 30));
    const antes = process.env.TZ;
    try {
      process.env.TZ = 'America/Sao_Paulo';
      expect(diaDe(instante)).toBe('2026-10-28');
      process.env.TZ = 'Asia/Tokyo';
      expect(diaDe(instante)).toBe('2026-10-29');
    } finally {
      if (antes === undefined) delete process.env.TZ;
      else process.env.TZ = antes;
    }
  });

  it('soma dias atravessando mês, ano e horário de verão', () => {
    expect(somarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29');
    expect(somarDias('2026-10-28', -28)).toBe('2026-09-30');
  });

  it('conta dias entre datas, com sinal', () => {
    expect(diasEntre('2026-10-28', '2026-10-30')).toBe(2);
    expect(diasEntre('2026-10-30', '2026-10-28')).toBe(-2);
    expect(diasEntre('2026-10-28', '2026-10-28')).toBe(0);
  });

  it('o deslocamento do /_dev avança e volta o relógio', () => {
    usarRelogio(() => new Date(2026, 9, 28, 12, 0, 0));
    definirDeslocamento(2);
    expect(hoje()).toBe('2026-10-30');
    definirDeslocamento(-1);
    expect(diaDe(agora())).toBe('2026-10-27');
  });
});
