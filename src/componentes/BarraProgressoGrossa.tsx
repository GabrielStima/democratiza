import estilos from './BarraProgressoGrossa.module.css';

interface Props {
  /** 0 a 100. */
  valor: number;
  rotulo: string;
}

/** Barra grossa do topo da lição no celular: verde, com um brilho por cima. */
export function BarraProgressoGrossa({ valor, rotulo }: Props) {
  const v = Math.min(100, Math.max(0, Math.round(valor)));
  return (
    <div
      class={estilos.trilho}
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div class={estilos.preenchimento} style={{ width: `${v}%` }}>
        <span class={estilos.brilho} aria-hidden="true" />
      </div>
    </div>
  );
}
