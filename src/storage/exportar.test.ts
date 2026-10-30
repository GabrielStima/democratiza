import { describe, expect, it } from 'vitest';
import { novaEntrada } from '../engine/revisao.ts';
import { estadoDeTeste } from '../testes/catalogo.ts';
import { gerarBackup, lerBackup, nomeDoArquivo } from './exportar.ts';

const feita = { acertos: 3, total: 3, em: '2026-10-25' };
const estado = estadoDeTeste('2026-10-28', {
  xp: 340,
  cursoAtual: 'comece-por-aqui',
  licoesConcluidas: { 'comece-por-aqui/u/l1': feita, 'outro-curso/u/l2': feita },
});
const caderno = {
  a: novaEntrada('a', 'comece-por-aqui/u/l1', '2026-10-25'),
  b: novaEntrada('b', 'outro-curso/u/l2', '2026-10-26'),
};
const arquivo = JSON.stringify(gerarBackup(estado, caderno, '2026-10-28T12:00:00.000Z'));

describe('backup', () => {
  it('salvar e abrir devolve exatamente o mesmo progresso', () => {
    const r = lerBackup(arquivo);
    expect(r).toMatchObject({ ok: true, estado, caderno });
  });

  it('resume o que o arquivo contém', () => {
    const r = lerBackup(arquivo);
    expect(r.ok && r.resumo).toEqual({ conceitos: 2, cursos: 2 });
  });

  it('o arquivo tem nome com a data', () => {
    expect(nomeDoArquivo('2026-10-28')).toBe('democratiza-backup-2026-10-28.json');
  });

  it.each([
    ['texto que não é JSON', 'isso não é json'],
    ['JSON de outro app', JSON.stringify({ app: 'outro', versao: 1 })],
    [
      'backup sem o estado',
      JSON.stringify({ app: 'democratiza', versao: 1, exportadoEm: 'x', caderno: [] }),
    ],
    [
      'estado com dados inválidos',
      JSON.stringify({
        app: 'democratiza',
        versao: 1,
        exportadoEm: 'x',
        estado: { versao: 1, xp: -1 },
        caderno: [],
      }),
    ],
    [
      'entrada do caderno inválida',
      JSON.stringify({ ...JSON.parse(arquivo), caderno: [{ conceitoId: 'a', caixa: 99 }] }),
    ],
  ])('recusa %s', (_nome, texto) => {
    expect(lerBackup(texto).ok).toBe(false);
  });

  it('recusa backup de uma versão mais nova', () => {
    const r = lerBackup(JSON.stringify({ ...JSON.parse(arquivo), versao: 2 }));
    expect(!r.ok && r.motivo).toContain('mais nova');
  });

  it('aplica o renomeados.json ao abrir', () => {
    const r = lerBackup(arquivo, { a: 'alfa', 'comece-por-aqui': 'inicio' });
    expect(r.ok && Object.keys(r.caderno).sort()).toEqual(['alfa', 'b']);
    expect(r.ok && r.estado.cursoAtual).toBe('inicio');
  });
});
