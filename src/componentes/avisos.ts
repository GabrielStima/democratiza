import { signal } from '@preact/signals';

export interface AvisoItem {
  id: number;
  texto: string;
}

export const avisos = signal<AvisoItem[]>([]);
let proximoId = 1;

/** Mostra uma mensagem rápida que some sozinha. */
export function mostrarAviso(texto: string, duracaoMs = 4000): void {
  const id = proximoId++;
  avisos.value = [...avisos.value, { id, texto }];
  setTimeout(() => dispensarAviso(id), duracaoMs);
}

export function dispensarAviso(id: number): void {
  avisos.value = avisos.value.filter((a) => a.id !== id);
}
