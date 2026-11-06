import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { arquivosDoGit, lerTermos, procurar } from './checar-marcas.ts';

const FIXTURES = join(process.cwd(), 'tests', 'fixtures', 'marcas');
const termos = lerTermos(join(FIXTURES, 'termos.json'));
const temporarias: string[] = [];
afterEach(() => temporarias.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('checar-marcas', () => {
  it('não acha nada em uma pasta limpa', () => {
    expect(procurar(join(FIXTURES, 'limpo'), termos)).toEqual([]);
  });

  it('acha o termo vetado, sem diferenciar maiúsculas, com arquivo e linha', () => {
    const raiz = join(FIXTURES, 'com-marca');
    expect(procurar(raiz, termos)).toEqual([
      { arquivo: 'texto.md', linha: 2, termo: 'marcafalsa' },
    ]);
  });

  it('ignora node_modules, dist, arquivos ._ e os arquivos pedidos', () => {
    const raiz = mkdtempSync(join(tmpdir(), 'marcas-'));
    temporarias.push(raiz);
    for (const p of ['node_modules', 'dist']) {
      mkdirSync(join(raiz, p));
      writeFileSync(join(raiz, p, 'a.txt'), 'marcafalsa');
    }
    writeFileSync(join(raiz, '._lixo'), 'marcafalsa');
    writeFileSync(join(raiz, 'termos.json'), '{"termos":["marcafalsa"]}');
    writeFileSync(join(raiz, 'ok.txt'), 'nada aqui');
    expect(procurar(raiz, termos, [join(raiz, 'termos.json')])).toEqual([]);
    writeFileSync(join(raiz, 'ruim.txt'), 'ok\nMARCAFALSA');
    expect(procurar(raiz, termos, [join(raiz, 'termos.json')])).toHaveLength(1);
  });

  it('com uma lista de arquivos, lê só os da lista', () => {
    const raiz = join(FIXTURES, 'com-marca');
    expect(procurar(raiz, termos, [], [])).toEqual([]);
    expect(procurar(raiz, termos, [], [join(raiz, 'texto.md')])).toHaveLength(1);
  });

  it('fora de um repositório git, arquivosDoGit devolve null', () => {
    const raiz = mkdtempSync(join(tmpdir(), 'marcas-'));
    temporarias.push(raiz);
    expect(arquivosDoGit(raiz)).toBeNull();
  });

  it('recusa um arquivo de termos malformado', () => {
    const raiz = mkdtempSync(join(tmpdir(), 'marcas-'));
    temporarias.push(raiz);
    writeFileSync(join(raiz, 't.json'), '{"termos": "nao-e-lista"}');
    expect(() => lerTermos(join(raiz, 't.json'))).toThrow(/lista/);
  });
});
