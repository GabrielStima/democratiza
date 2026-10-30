import type { Catalogo, CursoCatalogo } from '../content-schema/tipos.ts';
import type { Nivel } from '../content-schema/curso.ts';
import type { Caderno, Estado } from '../storage/estado.ts';
import { licaoParaContinuar } from './continuar.ts';
import {
  conceitosAprendidos,
  conceitosFaltantes,
  cursoLiberado,
  statusDasUnidades,
  type ConceitoFaltante,
  type StatusUnidade,
} from './desbloqueio.ts';
import { ofensivaAtual, ofensivaEmRisco, ultimosSeteDias } from './ofensiva.ts';
import {
  conceitosDoCurso,
  estadoDasLicoes,
  idLicao,
  listarLicoes,
  minutosEstimados,
  progressoDoCurso,
  proximaLicao,
  type EstadoLicao,
  type ProgressoCurso,
} from './progresso.ts';
import { conceitosVencidos } from './revisao.ts';
import { xpDeHoje } from './xp.ts';

export function enderecoDaLicao(cursoId: string, unidadeId: string, licaoId: string): string {
  return `/c/${cursoId}/${unidadeId}/${licaoId}`;
}

/** Primeira lição do primeiro curso do catálogo: para onde "Começar" leva quem é novo. */
export function primeiraLicaoDoSite(catalogo: Catalogo): string | null {
  const primeira = catalogo.cursos[0] ? listarLicoes(catalogo.cursos[0])[0] : undefined;
  return primeira ? enderecoDaLicao(primeira.cursoId, primeira.unidadeId, primeira.licaoId) : null;
}

/** Cursos que a pessoa já começou: com lição feita, o último usado ou o da lição em andamento. */
export function cursosComecados(estado: Estado, catalogo: Catalogo): CursoCatalogo[] {
  const andamento = estado.licaoEmAndamento?.id.split('/')[0];
  return catalogo.cursos.filter(
    (c) =>
      c.id === estado.cursoAtual ||
      c.id === andamento ||
      listarLicoes(c).some((l) => l.id in estado.licoesConcluidas),
  );
}

export interface CartaoContinuar {
  cursoTitulo: string;
  nivel: Nivel;
  licaoTitulo: string;
  /** "Unidade N · Lição X de Y" */
  unidade: number;
  numero: number;
  totalNaUnidade: number;
  desafio: boolean;
  pontos: EstadoLicao[];
  conceitosNovos: number;
  minutos: number;
  emAndamento: boolean;
  destino: string;
}

export interface CursoDaLista {
  id: string;
  titulo: string;
  nivel: Nivel;
  emDestaque: boolean;
  progresso: ProgressoCurso;
  proxima: string | null;
}

export interface CursoParaExplorar {
  id: string;
  titulo: string;
  nivel: Nivel;
  descricao: string;
  liberado: boolean;
  faltantes: (ConceitoFaltante & { cursoTitulo?: string })[];
}

export interface DadosHome {
  continuar: CartaoContinuar | null;
  cursos: CursoDaLista[];
  /** Quando a pessoa faz um curso só, a Home usa a variante "Seu progresso no curso". */
  umCursoSo: boolean;
  explorar: CursoParaExplorar[];
  ofensiva: {
    dias: number;
    recorde: number;
    emRisco: boolean;
    semana: { dia: string; estudou: boolean }[];
  };
  meta: { xp: number; meta: number; atingida: boolean };
  revisao: { vencidos: number };
  caderno: { total: number; recentes: string[] };
}

/** Tudo o que a Home com progresso mostra, já calculado. */
export function dadosDaHome(
  estado: Estado,
  caderno: Caderno,
  catalogo: Catalogo,
  hoje: string,
): DadosHome {
  const para = licaoParaContinuar(estado, catalogo, caderno);
  const cursoDoCartao = para ? catalogo.cursos.find((c) => c.id === para.cursoId) : undefined;
  let continuar: CartaoContinuar | null = null;
  if (para && cursoDoCartao) {
    const daUnidade = listarLicoes(cursoDoCartao).filter((l) => l.unidadeId === para.unidadeId);
    const estados = estadoDasLicoes(cursoDoCartao, estado.licoesConcluidas);
    continuar = {
      cursoTitulo: cursoDoCartao.titulo,
      nivel: cursoDoCartao.nivel,
      licaoTitulo: para.licao.titulo,
      unidade: para.unidadeIndice + 1,
      numero: daUnidade.findIndex((l) => l.id === para.id) + 1,
      totalNaUnidade: daUnidade.length,
      desafio: para.licao.tipo === 'desafio',
      pontos: daUnidade.map((l) => estados.get(l.id) ?? 'bloqueada'),
      conceitosNovos: para.licao.ensina.filter((id) => !(id in caderno)).length,
      minutos: minutosEstimados(para.licao.nCards, para.licao.nExercicios),
      emAndamento: para.emAndamento,
      destino: enderecoDaLicao(para.cursoId, para.unidadeId, para.licaoId),
    };
  }

  const comecados = cursosComecados(estado, catalogo);
  const cursos = comecados.map<CursoDaLista>((c) => ({
    id: c.id,
    titulo: c.titulo,
    nivel: c.nivel,
    emDestaque: c.id === estado.cursoAtual,
    progresso: progressoDoCurso(c, estado.licoesConcluidas),
    proxima: proximaLicao(c, estado.licoesConcluidas)?.licao.titulo ?? null,
  }));

  const aprendidos = conceitosAprendidos(caderno);
  const ids = new Set(comecados.map((c) => c.id));
  const explorar = catalogo.cursos
    .filter((c) => !ids.has(c.id))
    .map<CursoParaExplorar>((c) => ({
      id: c.id,
      titulo: c.titulo,
      nivel: c.nivel,
      descricao: c.descricao,
      liberado: cursoLiberado(c, aprendidos),
      faltantes: conceitosFaltantes(c, aprendidos, catalogo).map((f) => {
        const titulo = catalogo.cursos.find((x) => x.id === f.cursoId)?.titulo;
        return titulo ? { ...f, cursoTitulo: titulo } : f;
      }),
    }));

  const recentes = Object.values(caderno)
    .sort(
      (a, b) =>
        b.aprendidoEm.localeCompare(a.aprendidoEm) || a.conceitoId.localeCompare(b.conceitoId),
    )
    .slice(0, 4)
    .map((e) => catalogo.conceitos[e.conceitoId]?.nome ?? e.conceitoId);

  const xp = xpDeHoje(estado, hoje);
  return {
    continuar,
    cursos,
    umCursoSo: cursos.length === 1,
    explorar,
    ofensiva: {
      dias: ofensivaAtual(estado.ofensiva, hoje),
      recorde: estado.ofensiva.recorde,
      emRisco: ofensivaEmRisco(estado.ofensiva, hoje),
      semana: ultimosSeteDias(estado.diasEstudados, hoje),
    },
    meta: { xp, meta: estado.config.metaDiaria, atingida: xp >= estado.config.metaDiaria },
    revisao: { vencidos: conceitosVencidos(caderno, hoje).length },
    caderno: { total: Object.keys(caderno).length, recentes },
  };
}

export interface LicaoDoCurso {
  id: string;
  numero: number;
  titulo: string;
  desafio: boolean;
  estado: EstadoLicao;
  /** Nomes dos conceitos que a lição ensina; vazio no desafio ("Revisão da unidade"). */
  conceitos: string[];
  destino: string;
}

export interface UnidadeDoCurso {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  status: StatusUnidade;
  nLicoes: number;
  licoes: LicaoDoCurso[];
  /** "Libera ao terminar a Unidade 2" quando bloqueada. */
  aviso: string | null;
}

export interface DadosCurso {
  curso: CursoCatalogo;
  liberado: boolean;
  faltantes: (ConceitoFaltante & { cursoTitulo?: string })[];
  progresso: ProgressoCurso;
  /** Para onde vai o botão Continuar; null se o curso está bloqueado ou concluído. */
  continuar: { destino: string; rotulo: string } | null;
  unidades: UnidadeDoCurso[];
  conceitos: { aprendidos: number; total: number; nomes: string[]; mais: number };
  libera: { id: string; titulo: string }[];
}

const ETIQUETAS_VISIVEIS = 6;

/** Tudo o que a página do curso mostra. `estado` nulo é visitante: nada feito ainda. */
export function dadosDoCurso(
  curso: CursoCatalogo,
  estado: Pick<Estado, 'licoesConcluidas' | 'licaoEmAndamento'> | null,
  caderno: Caderno,
  catalogo: Catalogo,
): DadosCurso {
  const concluidas = estado?.licoesConcluidas ?? {};
  const aprendidos = conceitosAprendidos(caderno);
  const liberado = cursoLiberado(curso, aprendidos);
  const progresso = progressoDoCurso(curso, concluidas);
  const estadosLicao = estadoDasLicoes(curso, concluidas);
  const estadosUnidade = statusDasUnidades(curso, concluidas);

  const unidades = curso.unidades.map<UnidadeDoCurso>((u, i) => {
    const status = estadosUnidade.get(u.id) ?? 'bloqueada';
    return {
      id: u.id,
      numero: i + 1,
      titulo: u.titulo,
      descricao: u.descricao,
      status,
      nLicoes: u.licoes.length,
      aviso: status === 'bloqueada' ? `Libera ao terminar a Unidade ${i}` : null,
      licoes: u.licoes.map((l, n) => ({
        id: l.id,
        numero: n + 1,
        titulo: l.titulo,
        desafio: l.tipo === 'desafio',
        estado: liberado
          ? (estadosLicao.get(idLicao(curso.id, u.id, l.id)) ?? 'bloqueada')
          : 'bloqueada',
        conceitos:
          l.tipo === 'desafio' ? [] : l.ensina.map((c) => catalogo.conceitos[c]?.nome ?? c),
        destino: enderecoDaLicao(curso.id, u.id, l.id),
      })),
    };
  });

  const doAndamento =
    estado?.licaoEmAndamento && estado.licaoEmAndamento.id.startsWith(`${curso.id}/`)
      ? listarLicoes(curso).find((l) => l.id === estado.licaoEmAndamento?.id)
      : undefined;
  const proxima = doAndamento ?? proximaLicao(curso, concluidas);
  const feitas = progresso.feitas;
  const continuar =
    liberado && proxima
      ? {
          destino: enderecoDaLicao(proxima.cursoId, proxima.unidadeId, proxima.licaoId),
          rotulo: doAndamento || feitas > 0 ? 'Continuar' : 'Começar',
        }
      : null;

  const meus = conceitosDoCurso(curso, caderno);
  const nomesAprendidos = curso.ensina
    .filter((id) => id in caderno)
    .map((id) => catalogo.conceitos[id]?.nome ?? id);

  return {
    curso,
    liberado,
    faltantes: conceitosFaltantes(curso, aprendidos, catalogo).map((f) => {
      const titulo = catalogo.cursos.find((x) => x.id === f.cursoId)?.titulo;
      return titulo ? { ...f, cursoTitulo: titulo } : f;
    }),
    progresso,
    continuar,
    unidades,
    conceitos: {
      ...meus,
      nomes: nomesAprendidos.slice(0, ETIQUETAS_VISIVEIS),
      mais: Math.max(0, nomesAprendidos.length - ETIQUETAS_VISIVEIS),
    },
    libera: curso.libera.flatMap((id) => {
      const c = catalogo.cursos.find((x) => x.id === id);
      return c ? [{ id: c.id, titulo: c.titulo }] : [];
    }),
  };
}
