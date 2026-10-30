import { describe, expect, it } from 'vitest';
import { estadoDeTeste } from '../testes/catalogo.ts';
import { novaEntrada } from '../engine/revisao.ts';
import {
  aplicarRenomeados,
  aplicarRenomeadosCaderno,
  lerEstado,
  renomearId,
  type Migracao,
} from './migracoes.ts';

describe('renomeados.json', () => {
  it('troca o id inteiro e também o prefixo de uma lição', () => {
    const r = { 'a/b': 'a/c', antigo: 'novo' };
    expect(renomearId('antigo', r)).toBe('novo');
    expect(renomearId('a/b/licao', r)).toBe('a/c/licao');
    expect(renomearId('a/bb/licao', r)).toBe('a/bb/licao');
    expect(renomearId('outro', r)).toBe('outro');
  });

  it('migra o progresso sem perder nada', () => {
    const feita = { acertos: 3, total: 3, em: '2026-10-25' };
    const e = {
      ...estadoDeTeste(),
      cursoAtual: 'curso-velho',
      licoesConcluidas: { 'curso-velho/u/l': feita, 'curso-velho/u/m': feita },
      licaoEmAndamento: { id: 'curso-velho/u/n', etapa: 'pratica' as const },
    };
    const r = aplicarRenomeados(e, { 'curso-velho': 'curso-novo' });
    expect(r.cursoAtual).toBe('curso-novo');
    expect(Object.keys(r.licoesConcluidas)).toEqual(['curso-novo/u/l', 'curso-novo/u/m']);
    expect(r.licoesConcluidas['curso-novo/u/l']).toEqual(feita);
    expect(r.licaoEmAndamento?.id).toBe('curso-novo/u/n');
  });

  it('migra o caderno: id do conceito e lição de origem', () => {
    const caderno = { velho: novaEntrada('velho', 'c/u/velha', '2026-10-01') };
    const r = aplicarRenomeadosCaderno(caderno, { velho: 'novo', 'c/u/velha': 'c/u/nova' });
    expect(r['novo']).toMatchObject({ conceitoId: 'novo', licaoId: 'c/u/nova' });
    expect(r['velho']).toBeUndefined();
  });

  it('sem renomeações devolve o mesmo objeto', () => {
    const e = estadoDeTeste();
    expect(aplicarRenomeados(e, {})).toBe(e);
  });
});

describe('migração de versão', () => {
  const v1 = estadoDeTeste('2026-10-28');

  it('lê o estado atual sem mudar nada', () => {
    const r = lerEstado(JSON.parse(JSON.stringify(v1)));
    expect(r).toEqual({ ok: true, estado: v1 });
  });

  it('aplica a cadeia de migrações de uma versão antiga', () => {
    const legado = { ...v1, versao: 0, pontos: 340, xp: undefined };
    const migrar: Migracao[] = [({ pontos, ...resto }) => ({ ...resto, versao: 1, xp: pontos })];
    const r = lerEstado(legado, {}, migrar);
    expect(r.ok && r.estado.xp).toBe(340);
  });

  it('recusa estado de uma versão mais nova', () => {
    const r = lerEstado({ ...v1, versao: 2 });
    expect(r).toMatchObject({ ok: false });
    expect(!r.ok && r.motivo).toContain('mais nova');
  });

  it('recusa lixo e dados inválidos, dizendo o campo', () => {
    expect(lerEstado('texto')).toMatchObject({ ok: false });
    expect(lerEstado(null)).toMatchObject({ ok: false });
    expect(lerEstado({ ...v1, xp: -5 })).toMatchObject({ ok: false });
    const r = lerEstado({ ...v1, config: { metaDiaria: 30, som: true } });
    expect(!r.ok && r.motivo).toContain('config.metaDiaria');
  });

  it('aceita campos novos dentro da lição em andamento', () => {
    const r = lerEstado({
      ...v1,
      licaoEmAndamento: { id: 'a/b/c', etapa: 'pratica', fila: [1, 2], palpite: 0 },
    });
    expect(r.ok && r.estado.licaoEmAndamento).toMatchObject({ fila: [1, 2], palpite: 0 });
  });
});
