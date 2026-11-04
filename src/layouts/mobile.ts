import { signal } from '@preact/signals';

/** De 1024 px para cima vale o layout desktop; abaixo, o mobile. */
export const PONTO_QUEBRA = 1024;
export const CONSULTA_MOBILE = `(max-width: ${PONTO_QUEBRA - 0.02}px)`;

interface Consulta {
  matches: boolean;
  addEventListener: (tipo: 'change', f: (e: { matches: boolean }) => void) => void;
}

/** Verdadeiro quando a janela é mais estreita que o ponto de quebra. Muda sozinho ao redimensionar. */
export const ehMobile = signal(false);

/** Liga o sinal a uma consulta de mídia. Separado do navegador para poder ser testado. */
export function ligarMobile(consulta: Consulta | null): void {
  ehMobile.value = consulta?.matches ?? false;
  consulta?.addEventListener('change', (e) => {
    ehMobile.value = e.matches;
  });
}

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  ligarMobile(window.matchMedia(CONSULTA_MOBILE));
}
