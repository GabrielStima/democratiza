import type { Catalogo } from '../content-schema/tipos.ts';
import type { Caderno, Estado } from '../storage/estado.ts';
import { conceitosAprendidos, cursoLiberado } from './desbloqueio.ts';
import { listarLicoes, proximaLicao, type LicaoNaOrdem } from './progresso.ts';

export interface ParaContinuar extends LicaoNaOrdem {
  emAndamento: boolean;
}

/**
 * O que o botão "Continuar" abre: a lição em andamento; senão a próxima do último curso
 * usado; senão a próxima do primeiro curso liberado que ainda tem lição por fazer.
 */
export function licaoParaContinuar(
  estado: Pick<Estado, 'licaoEmAndamento' | 'cursoAtual' | 'licoesConcluidas'>,
  catalogo: Catalogo,
  caderno: Caderno,
): ParaContinuar | null {
  const todas = catalogo.cursos.flatMap((c) => listarLicoes(c));
  if (estado.licaoEmAndamento) {
    const l = todas.find((x) => x.id === estado.licaoEmAndamento?.id);
    if (l) return { ...l, emAndamento: true };
  }
  const aprendidos = conceitosAprendidos(caderno);
  const candidatos = [
    ...catalogo.cursos.filter((c) => c.id === estado.cursoAtual),
    ...catalogo.cursos.filter((c) => c.id !== estado.cursoAtual),
  ];
  for (const curso of candidatos) {
    if (!cursoLiberado(curso, aprendidos)) continue;
    const proxima = proximaLicao(curso, estado.licoesConcluidas);
    if (proxima) return { ...proxima, emAndamento: false };
  }
  return null;
}
