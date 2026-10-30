import type { ComponentChildren } from 'preact';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { catalogo } from '../conteudo/index.ts';
import { licaoParaContinuar } from '../engine/continuar.ts';
import { caderno, estado } from '../stores/index.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './Site.module.css';

/** Layout do visitante: cabeçalho e rodapé. */
export function Site({
  children,
  faixas = false,
}: {
  children: ComponentChildren;
  /** A página desenha as próprias faixas de ponta a ponta (Home do visitante). */
  faixas?: boolean;
}) {
  const e = estado.value;
  const continuar = e ? licaoParaContinuar(e, catalogo, caderno.value) : null;
  const primeiroCurso = catalogo.cursos[0]?.id;
  return (
    <div class={estilos.pagina}>
      <header class={estilos.cabecalho}>
        <div class={estilos.interno}>
          <a href="/" class={estilos.marca}>
            <Capi tamanho={48} />
            <span>democratiza</span>
          </a>
          <nav class={estilos.menu} aria-label="Principal">
            <a href="/#como-funciona">Como funciona</a>
            <a href={primeiroCurso ? `/c/${primeiroCurso}` : '/'}>Cursos</a>
            <a href="/sobre">Nossos princípios</a>
          </nav>
          {e ? (
            <Botao3D tamanho="pequeno" href={continuar ? `/c/${continuar.id}` : '/'}>
              Continuar
            </Botao3D>
          ) : (
            <Botao3D tamanho="pequeno" onClick={() => abrirMeta('primeira')}>
              Começar
            </Botao3D>
          )}
        </div>
      </header>
      <main class={faixas ? estilos.faixas : estilos.principal}>{children}</main>
      <footer class={estilos.rodape}>
        <div class={estilos.interno}>
          <span>Democratiza · gratuito, apartidário e com fonte em tudo.</span>
          <a href="/sobre">Sobre</a>
        </div>
      </footer>
    </div>
  );
}
