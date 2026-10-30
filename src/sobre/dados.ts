import type { ResumoBackup } from '../storage/exportar.ts';

/** "14 conceitos e 2 cursos", "1 conceito e 1 curso". */
export function textoResumo(r: ResumoBackup): string {
  const conceitos = r.conceitos === 1 ? '1 conceito' : `${r.conceitos} conceitos`;
  const cursos = r.cursos === 1 ? '1 curso' : `${r.cursos} cursos`;
  return `${conceitos} e ${cursos}`;
}

/** "usada em 1 lição", "usada em 3 lições". */
export function textoUso(n: number): string {
  return n === 1 ? 'usada em 1 lição' : `usada em ${n} lições`;
}
