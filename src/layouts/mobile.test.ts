import { describe, expect, it } from 'vitest';
import { CONSULTA_MOBILE, ehMobile, ligarMobile, PONTO_QUEBRA } from './mobile.ts';

function consultaFalsa(matches: boolean) {
  const ouvintes: ((e: { matches: boolean }) => void)[] = [];
  return {
    matches,
    addEventListener: (_: 'change', f: (e: { matches: boolean }) => void) => ouvintes.push(f),
    disparar: (m: boolean) => ouvintes.forEach((f) => f({ matches: m })),
  };
}

describe('detecção do layout mobile', () => {
  it('o ponto de quebra é 1024 px e a consulta pega só o que é menor', () => {
    expect(PONTO_QUEBRA).toBe(1024);
    expect(CONSULTA_MOBILE).toBe('(max-width: 1023.98px)');
  });

  it('começa com o valor da consulta e acompanha as mudanças', () => {
    const c = consultaFalsa(true);
    ligarMobile(c);
    expect(ehMobile.value).toBe(true);
    c.disparar(false);
    expect(ehMobile.value).toBe(false);
    c.disparar(true);
    expect(ehMobile.value).toBe(true);
  });

  it('sem consulta de mídia (ambiente sem navegador) vale o desktop', () => {
    ligarMobile(null);
    expect(ehMobile.value).toBe(false);
  });
});
