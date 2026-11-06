import { describe, expect, it } from 'vitest';
import { blocosParaHtml, identificador, lerDocumentoLegal } from './markdown.ts';

const CAB = '---\ntitulo: T\nresumo: R\natualizado: 2026-11-06\n---\n';

describe('markdown dos textos legais', () => {
  it('cria ids sem acento nos títulos', () => {
    expect(identificador('Licenças')).toBe('licencas');
    expect(identificador('Uso do nome, da logo e da Capi')).toBe('uso-do-nome-da-logo-e-da-capi');
    expect(blocosParaHtml('## Licenças')).toBe('<h2 id="licencas">Licenças</h2>');
  });

  it('junta linhas em parágrafos e agrupa listas', () => {
    const html = blocosParaHtml('um\ndois\n\n- a\n- b\n\nfim');
    expect(html).toBe('<p>um dois</p>\n<ul><li>a</li><li>b</li></ul>\n<p>fim</p>');
  });

  it('formata negrito, código e links; externo abre em outra aba', () => {
    const html = blocosParaHtml('**x** `y` [a](/sobre) [b](https://exemplo.org)');
    expect(html).toContain('<strong>x</strong>');
    expect(html).toContain('<code>y</code>');
    expect(html).toContain('<a href="/sobre">a</a>');
    expect(html).toContain('target="_blank" rel="noopener noreferrer">b</a>');
  });

  it('escapa HTML e recusa links perigosos', () => {
    const html = blocosParaHtml('<script>x</script> [c](javascript:alert(1))');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('href="javascript');
  });

  it('lê o cabeçalho e exige os campos e a data', () => {
    const d = lerDocumentoLegal('t.md', `${CAB}## Oi`);
    expect(d).toMatchObject({ titulo: 'T', resumo: 'R', atualizadoEm: '2026-11-06' });
    expect(() => lerDocumentoLegal('t.md', '## sem cabeçalho')).toThrow(/cabeçalho/);
    expect(() => lerDocumentoLegal('t.md', '---\ntitulo: T\n---\nx')).toThrow(/"resumo"/);
    expect(() =>
      lerDocumentoLegal('t.md', '---\ntitulo: T\nresumo: R\natualizado: ontem\n---\nx'),
    ).toThrow(/AAAA-MM-DD/);
  });
});
