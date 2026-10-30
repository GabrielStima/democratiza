import { Capi } from '../componentes/Capi';
import { Cartao } from '../componentes/Cartao';
import estilos from './paginas.module.css';

interface Props {
  titulo: string;
  milestone: string;
}

/** Página provisória das rotas que ainda não foram construídas. */
export function EmConstrucao({ titulo, milestone }: Props) {
  return (
    <Cartao class={estilos.centro}>
      <Capi tamanho={96} />
      <h1>{titulo}</h1>
      <p>Em construção. Esta tela chega no {milestone}.</p>
    </Cartao>
  );
}
