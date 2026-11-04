import type { EstadoLicao } from '../engine/progresso.ts';
import type { UnidadeDoCurso } from '../engine/telas.ts';

/** Quanto cada nó anda para o lado (em px), repetindo: o zigue-zague da trilha. */
export const DESLOCAMENTOS = [0, -46, -64, -46, 0, 46, 64, 46] as const;

export function deslocamento(indice: number): number {
  const n = DESLOCAMENTOS.length;
  return DESLOCAMENTOS[((indice % n) + n) % n] as number;
}

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
}

/** Nome do nó para leitor de tela: o que é e em que estado está. */
export function rotuloDoNo(no: Pick<NoDaTrilha, 'titulo' | 'tipo'>): string {
  switch (no.tipo) {
    case 'atual':
      return `Começar: ${no.titulo}`;
    case 'feita':
      return `${no.titulo} (feita)`;
    case 'desafio':
      return `${no.titulo} (desafio da unidade, bloqueado)`;
    case 'bloqueada':
      return `${no.titulo} (bloqueada)`;
  }
}

/** Os nós de uma unidade, na ordem das lições. */
export function nosDaUnidade(u: Pick<UnidadeDoCurso, 'licoes'>): NoDaTrilha[] {
  return u.licoes.map((l) => ({
    id: l.id,
    titulo: l.titulo,
    tipo: tipoDoNo(l.estado, l.desafio),
    destino: l.destino,
  }));
}
