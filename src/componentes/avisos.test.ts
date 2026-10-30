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
});
