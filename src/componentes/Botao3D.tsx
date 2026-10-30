import type { ComponentChildren } from 'preact';
import estilos from './Botao3D.module.css';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'neutro';

interface Props {
  variante?: VarianteBotao;
  desativado?: boolean;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: (e: MouseEvent) => void;
  larga?: boolean;
  children: ComponentChildren;
  'aria-label'?: string;
}

export function Botao3D({
  variante = 'primario',
  desativado = false,
  href,
  type = 'button',
  onClick,
  larga = false,
  children,
  ...resto
}: Props) {
  const classe = [
    estilos.botao,
    estilos[variante],
    desativado ? estilos.desativado : '',
    larga ? estilos.larga : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !desativado) {
    return (
      <a class={classe} href={href} onClick={onClick} {...resto}>
        {children}
      </a>
    );
  }
  return (
    <button class={classe} type={type} disabled={desativado} onClick={onClick} {...resto}>
      {children}
    </button>
  );
}
