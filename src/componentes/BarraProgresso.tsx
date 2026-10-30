import estilos from './BarraProgresso.module.css';

interface Props {
  /** Valor de 0 a 100. */
  valor: number;
  rotulo: string;
}

export function BarraProgresso({ valor, rotulo }: Props) {
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
      <div class={estilos.preenchimento} style={{ width: `${v}%` }} />
    </div>
  );
}
