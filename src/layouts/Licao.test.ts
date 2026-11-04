import { describe, expect, it } from 'vitest';
import { progressoDasFases } from './Licao';

describe('progressoDasFases', () => {
  const f = (...e: ('feita' | 'atual' | 'proxima')[]) =>
    e.map((estado, i) => ({ rotulo: `F${i}`, estado }));
  it('cada fase feita vale 25% e a atual dá um começo de 8%', () => {
    expect(progressoDasFases(f('atual', 'proxima', 'proxima', 'proxima'))).toBe(8);
    expect(progressoDasFases(f('feita', 'atual', 'proxima', 'proxima'))).toBe(33);
    expect(progressoDasFases(f('feita', 'feita', 'feita', 'proxima'))).toBe(83);
  });
  it('lição concluída enche a barra e sem fases fica zerada', () => {
    expect(progressoDasFases(f('feita', 'feita', 'feita', 'feita'))).toBe(100);
    expect(progressoDasFases([])).toBe(0);
  });
});
