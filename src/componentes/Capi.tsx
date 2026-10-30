interface Props {
  /** Lado em pixels. */
  tamanho?: number;
  /** Texto alternativo; vazio quando a imagem é só decorativa. */
  alt?: string;
}

/** Mascote do Democratiza. Arte provisória: troque public/capi.svg pela arte final. */
export function Capi({ tamanho = 110, alt = '' }: Props) {
  return (
    <img
      src="/capi.svg"
      alt={alt}
      width={tamanho}
      height={tamanho}
      style={{ flex: 'none', display: 'block' }}
    />
  );
}
