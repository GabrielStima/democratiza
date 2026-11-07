import type { EstadoLicao } from '../engine/progresso.ts';
import type { UnidadeDoCurso } from '../engine/telas.ts';

/** `desafio` é o troféu: uma lição de desafio que ainda está bloqueada. */
export type TipoNo = 'feita' | 'atual' | 'bloqueada' | 'desafio';

export function tipoDoNo(estado: EstadoLicao, desafio: boolean): TipoNo {
  if (estado === 'bloqueada') return desafio ? 'desafio' : 'bloqueada';
  return estado;
}

export interface NoDaTrilha {
  id: string;
  titulo: string;
  tipo: TipoNo;
  /** Endereço da lição; só a feita e a atual são abertas. */
  destino: string;
  /** Linha de apoio sob o nome (ex.: "2 conceitos"). */
  detalhe?: string;
}

function detalheDoNo(desafio: boolean, nConceitos: number): string {
  if (desafio) return 'Revisão dos conceitos da unidade';
  return `${nConceitos} ${nConceitos === 1 ? 'conceito' : 'conceitos'}`;
}

/** Os nós de uma unidade, na ordem das lições. */
export function nosDaUnidade(u: Pick<UnidadeDoCurso, 'licoes'>): NoDaTrilha[] {
  return u.licoes.map((l) => ({
    id: l.id,
    titulo: l.titulo,
    tipo: tipoDoNo(l.estado, l.desafio),
    destino: l.destino,
    detalhe: detalheDoNo(l.desafio, l.conceitos.length),
  }));
}
