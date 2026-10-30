import { clear, createStore, delMany, entries, setMany, type UseStore } from 'idb-keyval';
import { entradaCadernoSchema, type Caderno, type EntradaCaderno } from './estado.ts';

/** Onde o caderno de conceitos fica guardado (IndexedDB no navegador, memória nos testes). */
export interface ArmazemCaderno {
  carregar(): Promise<EntradaCaderno[]>;
  salvar(entradas: EntradaCaderno[]): Promise<void>;
  remover(conceitoIds: string[]): Promise<void>;
  limpar(): Promise<void>;
}

export function armazemMemoria(inicial: EntradaCaderno[] = []): ArmazemCaderno {
  const mapa = new Map(inicial.map((e) => [e.conceitoId, e]));
  return {
    carregar: async () => [...mapa.values()],
    salvar: async (es) => es.forEach((e) => mapa.set(e.conceitoId, e)),
    remover: async (ids) => ids.forEach((id) => mapa.delete(id)),
    limpar: async () => mapa.clear(),
  };
}

export function armazemIndexedDb(): ArmazemCaderno {
  let loja: UseStore | undefined;
  const obter = () => (loja ??= createStore('democratiza', 'caderno'));
  return {
    async carregar() {
      const todas = await entries<string, unknown>(obter());
      return todas.flatMap(([, v]) => {
        const r = entradaCadernoSchema.safeParse(v);
        return r.success ? [r.data] : [];
      });
    },
    salvar: (es) =>
      setMany(
        es.map((e) => [e.conceitoId, e]),
        obter(),
      ),
    remover: (ids) => delMany(ids, obter()),
    limpar: () => clear(obter()),
  };
}

export function paraCaderno(entradas: EntradaCaderno[]): Caderno {
  return Object.fromEntries(entradas.map((e) => [e.conceitoId, e]));
}

/** O que mudou entre dois cadernos: entradas novas ou alteradas, e conceitos que saíram. */
export function diferencas(
  antes: Caderno,
  depois: Caderno,
): { salvar: EntradaCaderno[]; remover: string[] } {
  const salvar = Object.values(depois).filter((e) => antes[e.conceitoId] !== e);
  const remover = Object.keys(antes).filter((id) => !(id in depois));
  return { salvar, remover };
}
