import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { avisos, dispensarAviso, mostrarAviso } from './avisos';

describe('avisos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    avisos.value = [];
  });
  afterEach(() => vi.useRealTimers());

  it('some sozinho depois do tempo', () => {
    mostrarAviso('Backup salvo.', 1000);
    expect(avisos.value).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(avisos.value).toHaveLength(0);
  });

  it('pode ser dispensado antes', () => {
    mostrarAviso('Oi');
    const [primeiro] = avisos.value;
    dispensarAviso(primeiro!.id);
    expect(avisos.value).toHaveLength(0);
  });

  it('com duração 0 fica até ser dispensado e guarda o botão', () => {
    const aoClicar = vi.fn();
    mostrarAviso('Nova versão disponível.', 0, { rotulo: 'Atualizar', aoClicar });
    vi.advanceTimersByTime(60_000);
    expect(avisos.value).toHaveLength(1);
    expect(avisos.value[0]?.acao?.rotulo).toBe('Atualizar');
    avisos.value[0]?.acao?.aoClicar();
    expect(aoClicar).toHaveBeenCalledOnce();
  });

  it('não repete um aviso que já está na tela', () => {
    mostrarAviso('Oi');
    mostrarAviso('Oi');
    expect(avisos.value).toHaveLength(1);
  });
});
