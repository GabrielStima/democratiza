import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { Botao3D } from '../componentes/Botao3D';
import { mostrarAviso } from '../componentes/avisos.ts';
import { Capi } from '../componentes/Capi';
import { hoje } from '../engine/relogio.ts';
import { conceitosVencidos } from '../engine/revisao.ts';
import { caderno, salvarBackup } from '../stores/index.ts';
import estilos from './App.module.css';

const ITENS = [
  { href: '/', rotulo: 'Aprender' },
  { href: '/revisar', rotulo: 'Revisar' },
  { href: '/caderno', rotulo: 'Caderno' },
  { href: '/sobre', rotulo: 'Sobre' },
];

/** Layout de quem já estuda: menu lateral. O item Cursos entra no M8. */
export function App({ children }: { children: ComponentChildren }) {
  const { path } = useLocation();
  const vencidos = conceitosVencidos(caderno.value, hoje()).length;
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
              {i.href === '/revisar' && vencidos > 0 && (
                <span class={estilos.contagem}>
                  {vencidos}
                  <span class="so-leitor"> conceitos para revisar</span>
                </span>
              )}
            </a>
          ))}
        </nav>
        <div class={estilos.nota}>
          <p>Seu progresso fica salvo só neste navegador.</p>
          <Botao3D
            variante="neutro"
            larga
            onClick={() => {
              salvarBackup();
              mostrarAviso('Backup salvo. Guarde o arquivo em um lugar seguro.');
            }}
          >
            Fazer backup
          </Botao3D>
        </div>
      </aside>
      <main class={estilos.principal}>{children}</main>
    </div>
  );
}
