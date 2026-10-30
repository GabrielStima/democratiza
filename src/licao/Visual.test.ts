import { describe, expect, it } from 'vitest';
import { VISUAIS_CONHECIDOS } from '../content-schema/visuais.ts';
import { VISUAIS } from './Visual.tsx';

describe('esquemas visuais', () => {
  it('todo componente existente está na lista que o build aceita, e vice-versa', () => {
    expect(Object.keys(VISUAIS).sort()).toEqual([...VISUAIS_CONHECIDOS].sort());
  });
});
