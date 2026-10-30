import type { CursoCatalogo, LicaoCatalogo } from '../content-schema/tipos.ts';
import type { Caderno, Estado } from '../storage/estado.ts';

type Concluidas = Estado['licoesConcluidas'];

/** Id completo de uma lição no progresso: "curso/unidade/licao". */
export function idLicao(cursoId: string, unidadeId: string, licaoId: string): string {
  return `${cursoId}/${unidadeId}/${licaoId}`;
}

export function partirIdLicao(
  id: string,
): { cursoId: string; unidadeId: string; licaoId: string } | null {
  const [cursoId, unidadeId, licaoId, resto] = id.split('/');
  if (!cursoId || !unidadeId || !licaoId || resto !== undefined) return null;
  return { cursoId, unidadeId, licaoId };
}

export interface LicaoNaOrdem {
  id: string;
  cursoId: string;
  unidadeId: string;
  licaoId: string;
  unidadeIndice: number;
  licao: LicaoCatalogo;
}

/** Todas as lições do curso na ordem em que devem ser feitas. */
export function listarLicoes(curso: CursoCatalogo): LicaoNaOrdem[] {
  return curso.unidades.flatMap((u, unidadeIndice) =>
    u.licoes.map((licao) => ({
      id: idLicao(curso.id, u.id, licao.id),
      cursoId: curso.id,
      unidadeId: u.id,
      licaoId: licao.id,
      unidadeIndice,
      licao,
    })),
  );
}

export type EstadoLicao = 'feita' | 'atual' | 'bloqueada';

/** Dentro de um curso as lições seguem em ordem: feitas, a próxima ("atual") e as bloqueadas. */
export function estadoDasLicoes(
  curso: CursoCatalogo,
  concluidas: Concluidas,
): Map<string, EstadoLicao> {
  const saida = new Map<string, EstadoLicao>();
  let achouAtual = false;
  for (const l of listarLicoes(curso)) {
    if (l.id in concluidas) saida.set(l.id, 'feita');
    else if (!achouAtual) {
      saida.set(l.id, 'atual');
      achouAtual = true;
    } else saida.set(l.id, 'bloqueada');
  }
  return saida;
}

export function proximaLicao(curso: CursoCatalogo, concluidas: Concluidas): LicaoNaOrdem | null {
  return listarLicoes(curso).find((l) => !(l.id in concluidas)) ?? null;
}

export interface ProgressoCurso {
  feitas: number;
  total: number;
  percentual: number;
  concluido: boolean;
  /** Unidade da próxima lição, começando em 1 (null se o curso acabou). */
  unidadeAtual: number | null;
  totalUnidades: number;
}

export function progressoDoCurso(curso: CursoCatalogo, concluidas: Concluidas): ProgressoCurso {
  const licoes = listarLicoes(curso);
  const feitas = licoes.filter((l) => l.id in concluidas).length;
  const proxima = proximaLicao(curso, concluidas);
  return {
    feitas,
    total: licoes.length,
    percentual: licoes.length === 0 ? 0 : Math.round((feitas / licoes.length) * 100),
    concluido: licoes.length > 0 && feitas === licoes.length,
    unidadeAtual: proxima ? proxima.unidadeIndice + 1 : null,
    totalUnidades: curso.unidades.length,
  };
}

export function progressoDaUnidade(
  curso: CursoCatalogo,
  unidadeId: string,
  concluidas: Concluidas,
): { feitas: number; total: number } {
  const da = listarLicoes(curso).filter((l) => l.unidadeId === unidadeId);
  return { feitas: da.filter((l) => l.id in concluidas).length, total: da.length };
}

/** Quantos conceitos do curso a pessoa já tem no caderno ("9 de 22"). */
export function conceitosDoCurso(
  curso: CursoCatalogo,
  caderno: Caderno,
): { aprendidos: number; total: number } {
  return {
    aprendidos: curso.ensina.filter((id) => id in caderno).length,
    total: curso.ensina.length,
  };
}

/** 1 minuto por card + 30 segundos por exercício, arredondado para cima (no mínimo 1). */
export function minutosEstimados(nCards: number, nExercicios: number): number {
  return Math.max(1, Math.ceil(nCards + nExercicios * 0.5));
}
