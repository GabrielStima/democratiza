import type { ComponentChildren } from 'preact';
import estilos from './Selo.module.css';

export type NivelCurso = 'introducao' | 'aprofundamento' | 'modulo';

export const ROTULO_NIVEL: Record<NivelCurso, string> = {
  introducao: 'Introdução',
  aprofundamento: 'Aprofundamento',
  modulo: 'Módulo',
};

interface Props {
  nivel: NivelCurso;
  children?: ComponentChildren;
}

export function Selo({ nivel, children }: Props) {
  return <span class={`${estilos.selo} ${estilos[nivel]}`}>{children ?? ROTULO_NIVEL[nivel]}</span>;
}
