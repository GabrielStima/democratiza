import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import estilos from './paginas.module.css';

export function Erro404() {
  return (
    <section class={estilos.erro}>
      <div class={estilos.circulo}>
        <Capi tamanho={120} />
      </div>
      <p class={estilos.codigo}>Erro 404</p>
      <h1>Essa página não existe</h1>
      <p class={estilos.texto}>
        O endereço pode ter mudado, ou essa lição ainda não foi publicada. Seu progresso continua
        salvo.
      </p>
      <div class={estilos.acoes}>
        <Botao3D href="/">Ir para o início</Botao3D>
        {/* Até o M8 não existe o catálogo; o botão leva ao curso "Comece por aqui". */}
        <Botao3D href="/c/comece-por-aqui" variante="neutro">
          Ver os cursos
        </Botao3D>
      </div>
    </section>
  );
}
