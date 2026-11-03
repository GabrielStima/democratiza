import { beforeEach, describe, expect, it, vi } from 'vitest';
import { avisos } from '../componentes/avisos.ts';
import { ligarAvisosDoPwa, TEXTO_NOVA_VERSAO, TEXTO_OFFLINE_PRONTO } from './registrar.ts';

describe('avisos do PWA', () => {
  beforeEach(() => {
    avisos.value = [];
  });

  function ligar() {
    const atualizar = vi.fn(() => Promise.resolve());
    let opcoes: { onNeedRefresh: () => void; onOfflineReady: () => void } | undefined;
    ligarAvisosDoPwa((o) => {
      opcoes = o;
      return atualizar;
    });
    if (!opcoes) throw new Error('o registro não foi chamado');
    return { atualizar, opcoes };
  }

  it('nova versão: aviso fixo com o botão Atualizar, que recarrega o app', () => {
    const { atualizar, opcoes } = ligar();
    opcoes.onNeedRefresh();
    expect(avisos.value[0]?.texto).toBe(TEXTO_NOVA_VERSAO);
    expect(avisos.value[0]?.acao?.rotulo).toBe('Atualizar');
    avisos.value[0]?.acao?.aoClicar();
    expect(atualizar).toHaveBeenCalledWith(true);
  });

  it('avisar de novo não duplica o aviso', () => {
    const { opcoes } = ligar();
    opcoes.onNeedRefresh();
    opcoes.onNeedRefresh();
    expect(avisos.value).toHaveLength(1);
  });

  it('pronto para usar offline: aviso rápido, sem botão', () => {
    const { opcoes } = ligar();
    opcoes.onOfflineReady();
    expect(avisos.value[0]?.texto).toBe(TEXTO_OFFLINE_PRONTO);
    expect(avisos.value[0]?.acao).toBeUndefined();
  });
});
