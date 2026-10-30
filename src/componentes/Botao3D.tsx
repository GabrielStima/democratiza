import type { ComponentChildren } from 'preact';
import estilos from './Botao3D.module.css';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'neutro';
export type TamanhoBotao = 'pequeno' | 'normal' | 'grande';

interface Props {
  variante?: VarianteBotao;
  /** `pequeno` é o do cabeçalho do site; `grande` é o do topo da Home. */
  tamanho?: TamanhoBotao;
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
  tamanho = 'normal',
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
    tamanho === 'normal' ? '' : estilos[tamanho],
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
