import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { lerPasta } from '../vite-plugins/leitor.ts';
import { construirConteudo } from '../src/content-schema/construir.ts';
import { formatarErros } from '../src/content-schema/formatar.ts';
import { criar } from './novo.ts';

const pastas: string[] = [];
function nova() {
  const p = mkdtempSync(join(tmpdir(), 'democratiza-novo-'));
  pastas.push(p);
  return p;
}
afterEach(() => pastas.splice(0).forEach((p) => rmSync(p, { recursive: true, force: true })));

describe('npm run novo', () => {
  it('gera curso, unidade e lição que passam na validação', () => {
    const raiz = nova();
    criar(raiz, ['curso', 'comece-por-aqui']);
    criar(raiz, ['unidade', 'comece-por-aqui', 'o-que-e-democracia']);
    const criados = criar(raiz, [
      'licao',
      'comece-por-aqui/o-que-e-democracia',
      'o-poder-vem-do-povo',
    ]);
    expect(criados).toEqual([
      'content/conceitos/o-poder-vem-do-povo.json',
      'content/cursos/01-comece-por-aqui/01-o-que-e-democracia/01-o-poder-vem-do-povo.json',
    ]);
    const r = construirConteudo(lerPasta(raiz), { mostrarRascunhos: true });
    expect(formatarErros(r.erros)).toBe('');
    expect(r.catalogo.cursos[0]?.unidades[0]?.licoes[0]?.status).toBe('rascunho');
  });

  it('numera a próxima lição e aceita conceitos existentes', () => {
    const raiz = nova();
    criar(raiz, ['curso', 'c']);
    criar(raiz, ['unidade', 'c', 'u']);
    criar(raiz, ['licao', 'c/u', 'primeira']);
    criar(raiz, ['conceito', 'outro']);
    const criados = criar(raiz, ['licao', 'c/u', 'segunda', '--conceito', 'outro']);
    expect(criados).toEqual(['content/cursos/01-c/01-u/02-segunda.json']);
    const r = construirConteudo(lerPasta(raiz), { mostrarRascunhos: true });
    expect(formatarErros(r.erros)).toBe('');
  });

  it('o esqueleto não pode ser marcado como revisado sem preencher', () => {
    const raiz = nova();
    criar(raiz, ['curso', 'c']);
    criar(raiz, ['unidade', 'c', 'u']);
    criar(raiz, ['licao', 'c/u', 'l']);
    const entrada = lerPasta(raiz).map((a) =>
      a.caminho.includes('01-l.json')
        ? {
            ...a,
            dados: {
              ...(a.dados as object),
              status: 'revisado',
              revisao: { por: 'G', em: '2026-10-28' },
            },
          }
        : a,
    );
    const r = construirConteudo(entrada, { mostrarRascunhos: true });
    expect(r.erros.some((e) => e.mensagem.includes('A preencher'))).toBe(true);
  });

  it('recusa ids inválidos, repetidos e pais que não existem', () => {
    const raiz = nova();
    expect(() => criar(raiz, ['curso', 'Comece Por Aqui'])).toThrow('minúsculas');
    criar(raiz, ['curso', 'c']);
    expect(() => criar(raiz, ['curso', 'c'])).toThrow('já existe');
    expect(() => criar(raiz, ['unidade', 'nao-existe', 'u'])).toThrow('não existe');
    expect(() => criar(raiz, ['licao', 'c/nada', 'l'])).toThrow('não existe');
  });
});
