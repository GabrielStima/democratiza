import type { ComponentChildren } from 'preact';
import estilos from './Cartao.module.css';

interface Props {
  children: ComponentChildren;
  destaque?: boolean;
  class?: string;
}

export function Cartao({ children, destaque = false, class: extra }: Props) {
  const classe = [estilos.cartao, destaque ? estilos.destaque : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
  return <div class={classe}>{children}</div>;
}
