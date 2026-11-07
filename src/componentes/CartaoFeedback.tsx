import type { ComponentChildren } from 'preact';
import { Capi } from './Capi';
import estilos from './CartaoFeedback.module.css';

interface Props {
  /** `quase` é o destaque amarelo da Checagem, onde errar não perde ponto. */
  tom: 'certa' | 'errada' | 'quase';
  titulo: string;
  /** Explicação, fonte e avisos. */
  children?: ComponentChildren;
}

/** Feedback de uma resposta: a Capi, o título e o texto, num cartão logo abaixo das opções. */
export function CartaoFeedback({ tom, titulo, children }: Props) {
  return (
    <section class={`${estilos.cartao} ${estilos[tom]}`}>
      <span class={estilos.capi} aria-hidden="true">
        <Capi tamanho={56} rounded />
      </span>
      <div class={estilos.corpo}>
        <h2 class={estilos.titulo}>{titulo}</h2>
        {children}
      </div>
    </section>
  );
}
