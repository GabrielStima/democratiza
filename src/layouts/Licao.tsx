import type { ComponentChildren } from 'preact';
import estilos from './Licao.module.css';

/** Layout da lição: sem menu, com topo próprio. O conteúdo da lição chega no M3. */
export function Licao({ children }: { children: ComponentChildren }) {
  return (
    <div class={estilos.pagina}>
      <header class={estilos.topo}>
        <div class={estilos.interno}>
          <a href="/" class={estilos.fechar} aria-label="Sair da lição">
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.8"
              stroke-linecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </a>
        </div>
      </header>
      <main class={estilos.principal}>{children}</main>
    </div>
  );
}
