import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lerPasta } from '../../vite-plugins/leitor.ts';
import { construirConteudo } from './construir.ts';
import { formatarErros } from './formatar.ts';

const FIXTURES = join(__dirname, '../../tests/fixtures');

function rodar(nome: string, mostrarRascunhos = true) {
  return construirConteudo(lerPasta(join(FIXTURES, nome)), { mostrarRascunhos });
}

function achar(nome: string, trecho: string) {
  const { erros } = rodar(nome);
  return erros.filter((e) => `${e.campo}: ${e.mensagem}`.includes(trecho));
}

describe('conteúdo válido', () => {
  it('a fixture válida não tem erros', () => {
    const r = rodar('00-valido');
    expect(r.erros).toEqual([]);
    expect(Object.keys(r.licoes)).toEqual(['curso/unidade/licao']);
  });

  it('o conteúdo Lorem do projeto é válido e tem 13 lições em 3 cursos', () => {
    const r = construirConteudo(lerPasta(join(__dirname, '../../content')), {
      mostrarRascunhos: true,
    });
    expect(formatarErros(r.erros)).toBe('');
    expect(r.catalogo.cursos.map((c) => c.id)).toEqual([
      'comece-por-aqui',
      'aprofundamento-lorem',
      'modulo-lorem',
    ]);
    expect(Object.keys(r.licoes)).toHaveLength(13);
  });

  it('sem rascunhos, nenhuma lição Lorem vai para o site', () => {
    const r = construirConteudo(lerPasta(join(__dirname, '../../content')), {
      mostrarRascunhos: false,
    });
    expect(r.erros).toEqual([]);
    expect(r.catalogo.cursos).toEqual([]);
    expect(r.licoes).toEqual({});
    expect(r.bibliografia).toEqual([]);
  });
});

describe('regras do build', () => {
  it('1. formato: campo obrigatório ausente', () => {
    const e = achar('01-campo-obrigatorio', 'definicao');
    expect(e[0]?.arquivo).toBe('content/conceitos/alfa.json');
  });

  it('1. formato: arquivo com nome fora do padrão NN-nome', () => {
    const e = achar('14-nome-fora-do-padrao', 'NN-nome');
    expect(e).toHaveLength(1);
  });

  it('1. formato: JSON inválido aponta o arquivo', () => {
    const { erros } = rodar('13-json-invalido');
    expect(erros[0]?.arquivo).toBe('content/cursos/01-curso/curso.json');
    expect(erros[0]?.mensagem).toContain('JSON inválido');
  });

  it('2. conceito citado precisa existir', () => {
    const e = achar('02-conceito-inexistente', '"fantasma" não existe em content/conceitos/');
    expect(e[0]?.campo).toBe('pratica[0].conceitos');
  });

  it('3. lição não usa conceito ensinado só depois', () => {
    const e = achar('03-conceito-nao-ensinado', '"beta" ainda não foi ensinado');
    expect(e[0]?.arquivo).toBe('content/cursos/01-curso/01-unidade/01-licao.json');
  });

  it('4. card sem fonte', () => {
    const e = achar('04-fonte-ausente', 'fonte');
    expect(e[0]?.campo).toContain('explicacao[0].fonte');
  });

  it('5. último card precisa de checagem', () => {
    const e = achar('05-ultimo-card-sem-checagem', 'o último card precisa de checagem');
    expect(e[0]?.campo).toBe('explicacao[1].checagem');
  });

  it('6. correntes só em módulo', () => {
    const e = achar('06-correntes-fora-de-modulo', '"correntes" só pode ser usado');
    expect(e[0]?.campo).toBe('pratica[0].tipo');
  });

  it('7. id repetido na mesma unidade', () => {
    expect(achar('07a-id-repetido', 'já existe outra lição com o id "licao"')).toHaveLength(1);
  });

  it('7. ciclo de pré-requisitos', () => {
    expect(achar('07b-ciclo-de-conceitos', 'ciclo de pré-requisitos')).toHaveLength(1);
  });

  it('8. lição revisada com visual inexistente falha; rascunho não', () => {
    expect(achar('08-visual-inexistente-revisado', '"nao-existe" não existe')).toHaveLength(1);
    const r = construirConteudo(
      [
        ...lerPasta(join(FIXTURES, '08-visual-inexistente-revisado')).map((a) =>
          a.caminho.endsWith('01-licao.json')
            ? { ...a, dados: { ...(a.dados as object), status: 'rascunho' } }
            : a,
        ),
      ],
      { mostrarRascunhos: true },
    );
    expect(r.erros).toEqual([]);
  });

  it('9. uma lição ensina de 1 a 3 conceitos', () => {
    const e = achar('09-ensina-demais', 'cada lição ensina de 1 a 3 conceitos');
    expect(e[0]?.campo).toBe('ensina');
  });

  it('termo [[...]] precisa estar no glossário', () => {
    expect(achar('10-termo-sem-glossario', 'o termo "termo" não tem definição')).toHaveLength(1);
  });

  it('lição revisada não pode ter "Lorem ipsum" nem "A preencher"', () => {
    expect(achar('11a-revisado-com-lorem', 'texto de teste')).toHaveLength(1);
  });

  it('lição revisada precisa dizer quem revisou e quando', () => {
    expect(achar('11b-revisado-sem-revisao', 'quem revisou')).toHaveLength(1);
  });
});

describe('rascunhos', () => {
  it('com rascunhos liga, as duas lições entram', () => {
    const r = rodar('12-rascunho-e-revisado', true);
    expect(r.erros).toEqual([]);
    expect(Object.keys(r.licoes)).toHaveLength(2);
  });

  it('com rascunhos desligados, só a revisada entra', () => {
    const r = rodar('12-rascunho-e-revisado', false);
    expect(Object.keys(r.licoes)).toEqual(['curso/unidade/publicada']);
    expect(r.catalogo.conceitos['beta']).toBeUndefined();
  });
});

describe('catálogo derivado', () => {
  const r = construirConteudo(lerPasta(join(__dirname, '../../content')), {
    mostrarRascunhos: true,
  });

  it('cada curso libera os que dependem dos seus conceitos', () => {
    const libera = Object.fromEntries(r.catalogo.cursos.map((c) => [c.id, c.libera]));
    expect(libera).toEqual({
      'comece-por-aqui': ['aprofundamento-lorem'],
      'aprofundamento-lorem': ['modulo-lorem'],
      'modulo-lorem': [],
    });
  });

  it('a bibliografia junta fontes iguais e conta as lições', () => {
    const itens = r.bibliografia.map((b) => b.descricao);
    expect(new Set(itens).size).toBe(itens.length);
    expect(r.bibliografia.every((b) => b.usadaEm >= 1)).toBe(true);
    expect([...itens].sort((a, b) => a.localeCompare(b, 'pt-BR'))).toEqual(itens);
  });

  it('cada conceito ensinado sabe onde é ensinado', () => {
    expect(r.catalogo.conceitos['lorem-01']?.ensinadoEm).toEqual({
      curso: 'comece-por-aqui',
      unidade: 'lorem-unidade-um',
      licao: 'lorem-licao-modelo',
    });
  });

  it('a ordem vem do número da pasta e o id vem do nome sem o número', () => {
    const c = r.catalogo.cursos[0];
    expect(c?.ordem).toBe(1);
    expect(c?.unidades.map((u) => u.id)).toEqual([
      'lorem-unidade-um',
      'lorem-unidade-dois',
      'lorem-unidade-tres',
    ]);
  });
});
