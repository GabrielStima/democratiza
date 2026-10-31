import type { Nivel } from '../content-schema/curso.ts';
import type { Catalogo } from '../content-schema/tipos.ts';
import type { Caderno, Estado } from '../storage/estado.ts';
import { conceitosAprendidos, conceitosFaltantes, cursoLiberado } from './desbloqueio.ts';
import { listarLicoes, progressoDoCurso } from './progresso.ts';
import { cursosComecados, ondeAprender } from './telas.ts';
import { normalizar } from './telasRevisao.ts';

export type EstadoDoCurso = 'andamento' | 'liberado' | 'bloqueado' | 'concluido';

export interface CursoDoCatalogo {
  id: string;
  titulo: string;
  descricao: string;
  nivel: Nivel;
  estado: EstadoDoCurso;
  nUnidades: number;
  nLicoes: number;
  nConceitos: number;
  percentual: number;
  /** Conceitos que faltam para liberar (só no curso bloqueado). */
  faltantes: { id: string; nome: string }[];
  /** "Você aprende os dois em “X”.", ou vazio. */
  ondeAprende: string;
}

export interface NivelDoCatalogo {
  nivel: Nivel;
  nome: string;
  descricao: string;
  cursos: CursoDoCatalogo[];
}

/** Os três níveis, na ordem em que aparecem na página Cursos. */
export const NIVEIS: { nivel: Nivel; nome: string; descricao: string }[] = [
  {
    nivel: 'introducao',
    nome: 'Introdução',
    descricao: 'O básico, para quem está começando do zero.',
  },
  {
    nivel: 'aprofundamento',
    nome: 'Aprofundamentos',
    descricao: 'Um tema visto com mais detalhe, com o que cada autor defende.',
  },
  {
    nivel: 'modulo',
    nome: 'Módulos',
    descricao: 'Um assunto específico, incluindo os debates entre correntes.',
  },
];

/**
 * Todos os cursos do catálogo, agrupados por nível, cada um com seu estado:
 * concluído, em andamento (já começado), liberado ou bloqueado.
 * Sem progresso (estado nulo) só o que não pede conceito está liberado.
 */
export function dadosDosCursos(
  estado: Estado | null,
  caderno: Caderno,
  catalogo: Catalogo,
): NivelDoCatalogo[] {
  const concluidas = estado?.licoesConcluidas ?? {};
  const comecados = new Set((estado ? cursosComecados(estado, catalogo) : []).map((c) => c.id));
  const aprendidos = conceitosAprendidos(caderno);
  const cursos = catalogo.cursos.map<CursoDoCatalogo>((c) => {
    const progresso = progressoDoCurso(c, concluidas);
    const liberado = cursoLiberado(c, aprendidos);
    const faltantes = liberado ? [] : conceitosFaltantes(c, aprendidos, catalogo);
    const estadoDoCurso: EstadoDoCurso = progresso.concluido
      ? 'concluido'
      : comecados.has(c.id) || progresso.feitas > 0
        ? 'andamento'
        : liberado
          ? 'liberado'
          : 'bloqueado';
    return {
      id: c.id,
      titulo: c.titulo,
      descricao: c.descricao,
      nivel: c.nivel,
      estado: estadoDoCurso,
      nUnidades: c.unidades.length,
      nLicoes: listarLicoes(c).length,
      nConceitos: c.ensina.length,
      percentual: progresso.percentual,
      faltantes: faltantes.map((f) => ({ id: f.id, nome: f.nome })),
      ondeAprende: ondeAprender(
        faltantes.map((f) => {
          const titulo = catalogo.cursos.find((x) => x.id === f.cursoId)?.titulo;
          return titulo ? { cursoTitulo: titulo } : {};
        }),
      ),
    };
  });
  return NIVEIS.map((n) => ({ ...n, cursos: cursos.filter((c) => c.nivel === n.nivel) }));
}

/** Busca por título e descrição, sem acento nem maiúscula. Níveis sem curso saem da lista. */
export function filtrarCursos(niveis: NivelDoCatalogo[], busca: string): NivelDoCatalogo[] {
  const termo = normalizar(busca);
  return niveis
    .map((n) => ({
      ...n,
      cursos: n.cursos.filter(
        (c) => termo === '' || normalizar(`${c.titulo} ${c.descricao}`).includes(termo),
      ),
    }))
    .filter((n) => n.cursos.length > 0);
}

/** "4 unidades · 20 lições · 22 conceitos". */
export function resumoDoCurso(
  c: Pick<CursoDoCatalogo, 'nUnidades' | 'nLicoes' | 'nConceitos'>,
): string {
  const un = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
  return [
    un(c.nUnidades, 'unidade', 'unidades'),
    un(c.nLicoes, 'lição', 'lições'),
    un(c.nConceitos, 'conceito', 'conceitos'),
  ].join(' · ');
}
