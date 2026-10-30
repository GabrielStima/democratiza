import { estadoSchema, type Estado } from './estado.ts';
import { lerEstado, type Migracao, type Renomeados } from './migracoes.ts';

export const CHAVE_ESTADO = 'democratiza:v1';
export const CHAVE_CORROMPIDO = 'democratiza:v1:corrompido';

export type ArmazemTexto = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function armazemTextoMemoria(): ArmazemTexto {
  const mapa = new Map<string, string>();
  return {
    getItem: (k) => mapa.get(k) ?? null,
    setItem: (k, v) => void mapa.set(k, v),
    removeItem: (k) => void mapa.delete(k),
  };
}

/** localStorage quando o navegador deixa; senão memória (o progresso então não sobrevive ao recarregar). */
export function armazemLocal(): { armazem: ArmazemTexto; persistente: boolean } {
  try {
    const teste = '__democratiza_teste__';
    localStorage.setItem(teste, '1');
    localStorage.removeItem(teste);
    return { armazem: localStorage, persistente: true };
  } catch {
    return { armazem: armazemTextoMemoria(), persistente: false };
  }
}

export interface CargaEstado {
  estado: Estado | null;
  /** O texto salvo estava quebrado ou inválido; uma cópia ficou guardada em CHAVE_CORROMPIDO. */
  corrompido: boolean;
}

/** Lê o progresso salvo. Sem nada salvo, quem chega é um visitante (estado nulo). */
export function carregarEstado(
  armazem: ArmazemTexto,
  renomeados: Renomeados = {},
  migracoes?: Migracao[],
): CargaEstado {
  let texto: string | null;
  try {
    texto = armazem.getItem(CHAVE_ESTADO);
  } catch {
    return { estado: null, corrompido: false };
  }
  if (texto === null) return { estado: null, corrompido: false };

  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    bruto = undefined;
  }
  const r = lerEstado(bruto, renomeados, migracoes);
  if (r.ok) return { estado: r.estado, corrompido: false };
  try {
    armazem.setItem(CHAVE_CORROMPIDO, texto);
  } catch {
    /* sem espaço: nada a fazer */
  }
  return { estado: null, corrompido: true };
}

export function salvarEstado(armazem: ArmazemTexto, estado: Estado): boolean {
  try {
    armazem.setItem(CHAVE_ESTADO, JSON.stringify(estadoSchema.parse(estado)));
    return true;
  } catch {
    return false;
  }
}

export function apagarEstado(armazem: ArmazemTexto): void {
  try {
    armazem.removeItem(CHAVE_ESTADO);
    armazem.removeItem(CHAVE_CORROMPIDO);
  } catch {
    /* ignora */
  }
}

/** Pede ao navegador para não apagar os dados por falta de espaço. Seguro em qualquer ambiente. */
export async function pedirPersistencia(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
