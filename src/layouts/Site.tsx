import type { ComponentChildren } from 'preact';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import estilos from './Site.module.css';

/** Layout do visitante: cabeçalho e rodapé. */
export function Site({ children }: { children: ComponentChildren }) {
  return (
    <div class={estilos.pagina}>
      <header class={estilos.cabecalho}>
        <div class={estilos.interno}>
          <a href="/" class={estilos.marca}>
            <Capi tamanho={40} />
            <span>Democratiza</span>
          </a>
          <nav class={estilos.menu} aria-label="Principal">
            <a href="/#como-funciona">Como funciona</a>
            <a href="/cursos">Cursos</a>
            <a href="/sobre">Nossos princípios</a>
          </nav>
          <Botao3D href="/c/comece-por-aqui">Começar</Botao3D>
        </div>
      </header>
      <main class={estilos.principal}>{children}</main>
      <footer class={estilos.rodape}>
        <div class={estilos.interno}>
          <span>Democratiza · gratuito, apartidário e com fonte em tudo.</span>
          <a href="/sobre">Sobre</a>
        </div>
      </footer>
    </div>
  );
}
