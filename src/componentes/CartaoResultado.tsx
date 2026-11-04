import type { ComponentChildren } from 'preact';
import estilos from './CartaoResultado.module.css';

interface Props {
  rotulo: string;
  valor: string;
  cor: 'ouro' | 'verde' | 'azul';
  icone?: ComponentChildren;
}

/** Número do resultado (XP, acertos, tempo): faixa colorida com o rótulo e o valor grande. */
export function CartaoResultado({ rotulo, valor, cor, icone }: Props) {
  return (
    <li class={`${estilos.cartao} ${estilos[cor]}`}>
      <span class={estilos.faixa}>{rotulo}</span>
      <span class={estilos.valor}>
        {icone}
        {valor}
      </span>
    </li>
  );
}

/** Lista que agrupa os cartões de resultado lado a lado. */
export function ResultadoEmLinha({ children }: { children: ComponentChildren }) {
  return (
    <ul class={estilos.linha} aria-label="Resultado">
      {children}
    </ul>
  );
}
