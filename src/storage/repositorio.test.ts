import { afterEach, describe, expect, it, vi } from 'vitest';
import { estadoDeTeste } from '../testes/catalogo.ts';
import {
  apagarEstado,
  armazemLocal,
  armazemTextoMemoria,
  carregarEstado,
  CHAVE_CORROMPIDO,
  CHAVE_ESTADO,
  pedirPersistencia,
  salvarEstado,
} from './repositorio.ts';

afterEach(() => vi.unstubAllGlobals());

describe('repositório do estado', () => {
  it('sem nada salvo, quem chega é visitante', () => {
    expect(carregarEstado(armazemTextoMemoria())).toEqual({ estado: null, corrompido: false });
  });

  it('salva e carrega o mesmo estado', () => {
    const arm = armazemTextoMemoria();
    const e = estadoDeTeste('2026-10-28', { xp: 340 });
    expect(salvarEstado(arm, e)).toBe(true);
    expect(JSON.parse(arm.getItem(CHAVE_ESTADO) as string).versao).toBe(1);
    expect(carregarEstado(arm).estado).toEqual(e);
  });

  it('texto quebrado não vira estado, mas fica guardado para recuperação', () => {
    const arm = armazemTextoMemoria();
    arm.setItem(CHAVE_ESTADO, '{ quebrado');
    expect(carregarEstado(arm)).toEqual({ estado: null, corrompido: true });
    expect(arm.getItem(CHAVE_CORROMPIDO)).toBe('{ quebrado');
  });

  it('estado com dados inválidos também é guardado, não apagado', () => {
    const arm = armazemTextoMemoria();
    arm.setItem(CHAVE_ESTADO, JSON.stringify({ versao: 1, xp: 'muito' }));
    expect(carregarEstado(arm).corrompido).toBe(true);
    expect(arm.getItem(CHAVE_CORROMPIDO)).not.toBeNull();
  });

  it('aplica o renomeados.json ao carregar', () => {
    const arm = armazemTextoMemoria();
    salvarEstado(arm, estadoDeTeste('2026-10-28', { cursoAtual: 'velho' }));
    expect(carregarEstado(arm, { velho: 'novo' }).estado?.cursoAtual).toBe('novo');
  });

  it('apagar remove o estado e a cópia corrompida', () => {
    const arm = armazemTextoMemoria();
    arm.setItem(CHAVE_ESTADO, '{');
    carregarEstado(arm);
    apagarEstado(arm);
    expect(arm.getItem(CHAVE_ESTADO)).toBeNull();
    expect(arm.getItem(CHAVE_CORROMPIDO)).toBeNull();
  });

  it('falha ao gravar devolve falso em vez de quebrar', () => {
    const cheio = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    expect(salvarEstado(cheio, estadoDeTeste())).toBe(false);
  });

  it('localStorage bloqueado cai para a memória e avisa que não é persistente', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('bloqueado');
      },
      removeItem: () => {},
      getItem: () => null,
    });
    const r = armazemLocal();
    expect(r.persistente).toBe(false);
    r.armazem.setItem('a', '1');
    expect(r.armazem.getItem('a')).toBe('1');
  });

  it('pedir persistência é seguro sem a API do navegador', async () => {
    vi.stubGlobal('navigator', {});
    expect(await pedirPersistencia()).toBe(false);
    vi.stubGlobal('navigator', { storage: { persist: async () => true } });
    expect(await pedirPersistencia()).toBe(true);
  });
});
