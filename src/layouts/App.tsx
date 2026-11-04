import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { Botao3D } from '../componentes/Botao3D';
import { mostrarAviso } from '../componentes/avisos.ts';
import { Capi } from '../componentes/Capi';
import { hoje } from '../engine/relogio.ts';
import { conceitosVencidos } from '../engine/revisao.ts';
import { caderno, salvarBackup } from '../stores/index.ts';
import estilos from './App.module.css';
import { BarraAbas, ABAS as ITENS } from './BarraAbas';
import { BarraTopo } from './BarraTopo';
import { ehMobile } from './mobile.ts';

/** Layout de quem já estuda: menu lateral no desktop; barra do topo e barra de abas no celular. */
export function App({ children }: { children: ComponentChildren }) {
  const { path } = useLocation();
  const vencidos = conceitosVencidos(caderno.value, hoje()).length;
  const mobile = ehMobile.value;
  return (
    <div class={mobile ? estilos.paginaMobile : estilos.pagina}>
      {mobile ? (
        <BarraTopo />
      ) : (
        <aside class={estilos.lateral}>
          <a href="/" class={estilos.marca}>
            <Capi tamanho={44} />
            <span>democratiza</span>
          </a>
          <nav aria-label="Principal" class={estilos.menu}>
            {ITENS.map((i) => (
              <a
                key={i.href}
                href={i.href}
                class={path === i.href ? estilos.ativo : ''}
                aria-current={path === i.href ? 'page' : undefined}
              >
                {i.icone}
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
              tamanho="pequeno"
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
      )}
      <main class={mobile ? estilos.principalMobile : estilos.principal}>{children}</main>
      {mobile && <BarraAbas vencidos={vencidos} />}
    </div>
  );
}
