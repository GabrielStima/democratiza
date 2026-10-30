import { describe, expect, it } from 'vitest';
import { textoResumo, textoUso } from './dados.ts';

describe('textos da página Sobre', () => {
  it('resume o backup no plural e no singular', () => {
    expect(textoResumo({ conceitos: 14, cursos: 2 })).toBe('14 conceitos e 2 cursos');
    expect(textoResumo({ conceitos: 1, cursos: 1 })).toBe('1 conceito e 1 curso');
    expect(textoResumo({ conceitos: 0, cursos: 0 })).toBe('0 conceitos e 0 cursos');
  });
  it('conta em quantas lições a fonte aparece', () => {
    expect(textoUso(1)).toBe('usada em 1 lição');
    expect(textoUso(34)).toBe('usada em 34 lições');
  });
});
