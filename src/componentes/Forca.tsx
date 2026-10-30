import { rotuloDaForca } from '../engine/telasRevisao.ts';
import estilos from './Forca.module.css';

/** Cinco barrinhas: quantas estão cheias é a caixa do conceito (1 a 5). */
export function Forca({ caixa, grande = false }: { caixa: number; grande?: boolean }) {
  return (
    <span
      class={`${estilos.forca} ${estilos[`f${caixa}`] ?? ''} ${grande ? estilos.grande : ''}`}
      role="img"
      aria-label={`Força ${caixa} de 5: ${rotuloDaForca(caixa)}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} class={`${estilos.barra} ${i <= caixa ? estilos.cheia : ''}`} />
      ))}
    </span>
  );
}
