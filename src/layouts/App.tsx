import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { Capi } from '../componentes/Capi';
import estilos from './App.module.css';

const ITENS = [
  { href: '/', rotulo: 'Aprender' },
  { href: '/cursos', rotulo: 'Cursos' },
  { href: '/revisar', rotulo: 'Revisar' },
  { href: '/caderno', rotulo: 'Caderno' },
  { href: '/sobre', rotulo: 'Sobre' },
];

/** Layout de quem já estuda: menu lateral. */
export function App({ children }: { children: ComponentChildren }) {
  const { path } = useLocation();
  return (
    <div class={estilos.pagina}>
      <aside class={estilos.lateral}>
        <a href="/" class={estilos.marca}>
          <Capi tamanho={40} />
          <span>Democratiza</span>
        </a>
        <nav aria-label="Principal" class={estilos.menu}>
          {ITENS.map((i) => (
            <a
              key={i.href}
              href={i.href}
              class={path === i.href ? estilos.ativo : ''}
              aria-current={path === i.href ? 'page' : undefined}
            >
              {i.rotulo}
            </a>
          ))}
        </nav>
        <p class={estilos.nota}>Seu progresso fica salvo só neste navegador.</p>
      </aside>
      <main class={estilos.principal}>{children}</main>
    </div>
  );
}
