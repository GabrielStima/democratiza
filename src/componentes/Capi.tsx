interface Props {
  /** Lado em pixels. */
  tamanho?: number;
  /** Texto alternativo; vazio quando a imagem é só decorativa. */
  alt?: string;
  class?: string;
}

/** Mascote do Democratiza. Arte provisória: troque public/capi.png pela arte final. */
export function Capi({ tamanho = 110, alt = '', class: classe }: Props) {
  return (
    <img
      src="/capi.png"
      alt={alt}
      class={classe}
      width={tamanho}
      height={tamanho}
      style={{ flex: 'none', display: 'block' }}
    />
  );
}
