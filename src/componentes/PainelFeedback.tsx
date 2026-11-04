import type { ComponentChildren } from 'preact';
import estilos from './PainelFeedback.module.css';

interface Props {
  tom: 'certa' | 'errada' | 'quase';
  titulo: string;
  /** Texto de apoio, fonte etc. */
  children?: ComponentChildren;
}

const ICONES = {
  certa: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  errada: <path d="M6 6l12 12M18 6L6 18" />,
  quase: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
} as const;

/** Feedback de uma resposta no celular: ícone redondo, título e o texto. A cor vem do tom. */
export function PainelFeedback({ tom, titulo, children }: Props) {
  return (
    <div class={`${estilos.painel} ${estilos[tom]}`}>
      <div class={estilos.linha}>
        <span class={estilos.icone}>
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            {ICONES[tom]}
          </svg>
        </span>
        <h2 class={estilos.titulo}>{titulo}</h2>
      </div>
      {children && <div class={estilos.corpo}>{children}</div>}
    </div>
  );
}
