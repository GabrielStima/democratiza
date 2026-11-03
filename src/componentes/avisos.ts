import { signal } from '@preact/signals';

/** Botão dentro do aviso (ex.: "Atualizar"). */
export interface AcaoDoAviso {
  rotulo: string;
  aoClicar: () => void;
}

export interface AvisoItem {
  id: number;
  texto: string;
  acao?: AcaoDoAviso;
}

export const avisos = signal<AvisoItem[]>([]);
let proximoId = 1;

/**
 * Mostra uma mensagem rápida que some sozinha. Com `duracaoMs` 0 ela fica até a pessoa
 * dispensar (ou usar o botão `acao`). Um aviso com o mesmo texto não é repetido.
 */
export function mostrarAviso(texto: string, duracaoMs = 4000, acao?: AcaoDoAviso): void {
  if (avisos.value.some((a) => a.texto === texto)) return;
  const id = proximoId++;
  avisos.value = [...avisos.value, acao ? { id, texto, acao } : { id, texto }];
  if (duracaoMs > 0) setTimeout(() => dispensarAviso(id), duracaoMs);
}

export function dispensarAviso(id: number): void {
  avisos.value = avisos.value.filter((a) => a.id !== id);
}
