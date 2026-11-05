import { afterEach, describe, expect, it, vi } from 'vitest';
import { novaEntrada } from '../engine/revisao.ts';
import { estadoDeTeste } from '../testes/catalogo.ts';
import { compartilharBackup, gerarBackup, lerBackup, nomeDoArquivo } from './exportar.ts';

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

describe('compartilharBackup', () => {
  const backup = gerarBackup(estado, caderno, '2026-10-28T12:00:00.000Z');

  function espiarDownload() {
    URL.createObjectURL = vi.fn(() => 'blob:teste');
    URL.revokeObjectURL = vi.fn();
    return vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  }
  afterEach(() => vi.restoreAllMocks());

  it('usa o compartilhamento do aparelho quando ele aceita arquivos', async () => {
    const baixou = espiarDownload();
    const share = vi.fn(async () => {});
    const destino = await compartilharBackup(backup, '2026-10-28', {
      canShare: () => true,
      share,
    });
    expect(destino).toBe('compartilhado');
    expect(share).toHaveBeenCalledOnce();
    const arquivo = (share.mock.calls[0] as unknown as [ShareData])[0].files?.[0];
    expect(arquivo?.name).toBe('democratiza-backup-2026-10-28.json');
    expect(baixou).not.toHaveBeenCalled();
  });

  it('não baixa nada quando a pessoa fecha a folha de compartilhar', async () => {
    const baixou = espiarDownload();
    const destino = await compartilharBackup(backup, '2026-10-28', {
      canShare: () => true,
      share: async () => {
        throw new DOMException('fechou', 'AbortError');
      },
    });
    expect(destino).toBe('cancelado');
    expect(baixou).not.toHaveBeenCalled();
  });

  it('baixa o arquivo quando o aparelho não compartilha arquivos', async () => {
    const baixou = espiarDownload();
    expect(await compartilharBackup(backup, '2026-10-28', {})).toBe('baixado');
    expect(
      await compartilharBackup(backup, '2026-10-28', { canShare: () => false, share: vi.fn() }),
    ).toBe('baixado');
    expect(baixou).toHaveBeenCalledTimes(2);
  });

  it('baixa o arquivo se o compartilhamento falhar por outro motivo', async () => {
    const baixou = espiarDownload();
    const destino = await compartilharBackup(backup, '2026-10-28', {
      canShare: () => true,
      share: async () => {
        throw new Error('sem permissão');
      },
    });
    expect(destino).toBe('baixado');
    expect(baixou).toHaveBeenCalledOnce();
  });
});
