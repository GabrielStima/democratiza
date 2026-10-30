import { estadoSchema, VERSAO_ATUAL, type Caderno, type Estado } from './estado.ts';

/** { idAntigo: idNovo } vindo de content/renomeados.json. */
export type Renomeados = Record<string, string>;

/**
 * Troca um id antigo pelo novo. Vale para o id inteiro ("curso", "conceito") e também para
 * um prefixo de lição: renomear a unidade "a/b" para "a/c" muda "a/b/licao" para "a/c/licao".
 */
export function renomearId(id: string, renomeados: Renomeados): string {
  const direto = renomeados[id];
  if (direto !== undefined) return direto;
  for (const [antigo, novo] of Object.entries(renomeados)) {
    if (id.startsWith(`${antigo}/`)) return `${novo}${id.slice(antigo.length)}`;
  }
  return id;
}

function mapearChaves<T>(obj: Record<string, T>, f: (k: string) => string): Record<string, T> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [f(k), v]));
}

export function aplicarRenomeados(estado: Estado, r: Renomeados): Estado {
  if (Object.keys(r).length === 0) return estado;
  return {
    ...estado,
    cursoAtual: estado.cursoAtual === null ? null : renomearId(estado.cursoAtual, r),
    licoesConcluidas: mapearChaves(estado.licoesConcluidas, (k) => renomearId(k, r)),
    licaoEmAndamento: estado.licaoEmAndamento
      ? { ...estado.licaoEmAndamento, id: renomearId(estado.licaoEmAndamento.id, r) }
      : null,
  };
}

export function aplicarRenomeadosCaderno(caderno: Caderno, r: Renomeados): Caderno {
  if (Object.keys(r).length === 0) return caderno;
  const novo: Caderno = {};
  let mudou = false;
  for (const e of Object.values(caderno)) {
    const conceitoId = renomearId(e.conceitoId, r);
    const licaoId = renomearId(e.licaoId, r);
    if (conceitoId === e.conceitoId && licaoId === e.licaoId) novo[e.conceitoId] = e;
    else {
      novo[conceitoId] = { ...e, conceitoId, licaoId };
      mudou = true;
    }
  }
  return mudou ? novo : caderno;
}

/** Cada migração leva o estado da versão `i` para a `i + 1`. Hoje só existe a versão 1. */
export type Migracao = (bruto: Record<string, unknown>) => Record<string, unknown>;
export const MIGRACOES: Migracao[] = [];

export type ResultadoEstado = { ok: true; estado: Estado } | { ok: false; motivo: string };

/** Migra um estado salvo (qualquer versão) até a atual e valida o resultado. */
export function lerEstado(
  bruto: unknown,
  renomeados: Renomeados = {},
  migracoes: Migracao[] = MIGRACOES,
): ResultadoEstado {
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    return { ok: false, motivo: 'o progresso salvo não tem o formato esperado' };
  }
  let atual = bruto as Record<string, unknown>;
  const versao = atual['versao'];
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 0) {
    return { ok: false, motivo: 'o progresso salvo não informa a versão' };
  }
  if (versao > VERSAO_ATUAL) {
    return { ok: false, motivo: 'o progresso foi salvo por uma versão mais nova do Democratiza' };
  }
  for (let v = versao; v < VERSAO_ATUAL; v++) {
    const passo = migracoes[v];
    if (!passo) return { ok: false, motivo: `não existe migração da versão ${v}` };
    atual = passo(atual);
  }
  const r = estadoSchema.safeParse(atual);
  if (!r.success) {
    const i = r.error.issues[0];
    return { ok: false, motivo: `dados inválidos em "${i?.path.join('.')}": ${i?.message}` };
  }
  return { ok: true, estado: aplicarRenomeados(r.data, renomeados) };
}
