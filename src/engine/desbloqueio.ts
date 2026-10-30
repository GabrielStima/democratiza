import type { Catalogo, CursoCatalogo } from '../content-schema/tipos.ts';
import type { Caderno, Estado } from '../storage/estado.ts';
import { estadoDasLicoes, idLicao, listarLicoes } from './progresso.ts';

/** Conceitos que a pessoa já tem no caderno, venham de onde vierem. */
export function conceitosAprendidos(caderno: Caderno): Set<string> {
  return new Set(Object.keys(caderno));
}

/** Um curso é liberado quando todos os `requer_conceitos` estão no caderno. */
export function cursoLiberado(curso: CursoCatalogo, aprendidos: ReadonlySet<string>): boolean {
  return curso.requerConceitos.every((id) => aprendidos.has(id));
}

export interface ConceitoFaltante {
  id: string;
  nome: string;
  /** Curso em que o conceito é ensinado, para o "aprenda em ...". */
  cursoId?: string;
}

export function conceitosFaltantes(
  curso: CursoCatalogo,
  aprendidos: ReadonlySet<string>,
  catalogo: Catalogo,
): ConceitoFaltante[] {
  return curso.requerConceitos
    .filter((id) => !aprendidos.has(id))
    .map((id) => {
      const c = catalogo.conceitos[id];
      return {
        id,
        nome: c?.nome ?? id,
        ...(c?.ensinadoEm ? { cursoId: c.ensinadoEm.curso } : {}),
      };
    });
}

/** Cursos que ficaram liberados com os conceitos novos (o "Desbloqueado:" da lição concluída). */
export function novosDesbloqueios(
  catalogo: Catalogo,
  antes: ReadonlySet<string>,
  depois: ReadonlySet<string>,
): CursoCatalogo[] {
  return catalogo.cursos.filter((c) => !cursoLiberado(c, antes) && cursoLiberado(c, depois));
}

export type StatusCurso = 'bloqueado' | 'liberado' | 'andamento' | 'concluido';

export function statusDoCurso(
  curso: CursoCatalogo,
  estado: Pick<Estado, 'licoesConcluidas'>,
  caderno: Caderno,
): StatusCurso {
  if (!cursoLiberado(curso, conceitosAprendidos(caderno))) return 'bloqueado';
  const licoes = listarLicoes(curso);
  const feitas = licoes.filter(
    (l) => idLicao(curso.id, l.unidadeId, l.licaoId) in estado.licoesConcluidas,
  );
  if (licoes.length > 0 && feitas.length === licoes.length) return 'concluido';
  return feitas.length > 0 ? 'andamento' : 'liberado';
}

export type StatusUnidade = 'feita' | 'atual' | 'bloqueada';

/** Unidades abrem em ordem: a atual é a primeira que ainda tem lição por fazer. */
export function statusDasUnidades(
  curso: CursoCatalogo,
  concluidas: Estado['licoesConcluidas'],
): Map<string, StatusUnidade> {
  const estados = estadoDasLicoes(curso, concluidas);
  const saida = new Map<string, StatusUnidade>();
  let achouAtual = false;
  for (const u of curso.unidades) {
    const todas = u.licoes.every((l) => estados.get(idLicao(curso.id, u.id, l.id)) === 'feita');
    if (todas) saida.set(u.id, 'feita');
    else if (!achouAtual) {
      saida.set(u.id, 'atual');
      achouAtual = true;
    } else saida.set(u.id, 'bloqueada');
  }
  return saida;
}
