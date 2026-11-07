import { Capi } from '../componentes/Capi';
import { IconeSequencia } from '../componentes/IconeSequencia';
import { ofensivaAtual } from '../engine/ofensiva.ts';
import { hoje } from '../engine/relogio.ts';
import { xpDeHoje } from '../engine/xp.ts';
import { estado } from '../stores/index.ts';
import estilos from './BarraTopo.module.css';

/** Topo do app no celular: a Capi (leva aos cursos), a sequência e o XP de hoje. */
export function BarraTopo() {
  const e = estado.value;
  const dias = e ? ofensivaAtual(e.ofensiva, hoje()) : 0;
  const xp = e ? xpDeHoje(e, hoje()) : 0;
  return (
    <header class={estilos.topo}>
      <a href="/cursos" class={estilos.curso} aria-label="Ver os cursos">
        <Capi tamanho={28} />
      </a>
      <div class={estilos.numeros}>
        <span class={`${estilos.numero} ${estilos.chama}`}>
          <IconeSequencia tamanho={26} />
          {dias}
          <span class="so-leitor"> {dias === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </span>
        <span class={`${estilos.numero} ${estilos.raio}`}>
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="var(--amarelo-ouro)"
            stroke="var(--amarelo-icone)"
            stroke-width="2"
            stroke-linejoin="round"
          >
            <path d="M13 2L5 14h6l-1 8 8-12h-6z" />
          </svg>
          {xp}
          <span class="so-leitor"> XP hoje</span>
        </span>
      </div>
    </header>
  );
}
