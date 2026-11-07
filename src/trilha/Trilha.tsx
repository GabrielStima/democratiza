import type { JSX } from 'preact';
import { Capi } from '../componentes/Capi';
import { type NoDaTrilha, type TipoNo } from './nos.ts';
import estilos from './trilha.module.css';

const ICONES: Record<Exclude<TipoNo, 'atual'>, JSX.Element> = {
  feita: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  bloqueada: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  desafio: (
    <>
      <path d="M8 4h8v6a4 4 0 0 1-8 0z" />
      <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" />
      <path d="M12 14v4M8 20h8" />
    </>
  ),
};

/** Marco quadrado de canto arredondado: visto (feita), número (atual) ou cadeado/troféu. */
function Marco({ tipo, numero }: { tipo: TipoNo; numero: number }) {
  if (tipo === 'atual') {
    return (
      <span class={`${estilos.marco} ${estilos.marco_atual}`} aria-hidden="true">
        {numero}
      </span>
    );
  }
  return (
    <span class={`${estilos.marco} ${estilos[`marco_${tipo}`]}`} aria-hidden="true">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width={tipo === 'feita' ? 3.2 : 2.6}
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {ICONES[tipo]}
      </svg>
    </span>
  );
}

const ESTADO_ESCRITO: Record<TipoNo, string> = {
  feita: 'Feita',
  atual: 'Agora',
  bloqueada: 'Bloqueada · libera ao terminar a anterior',
  desafio: 'Desafio da unidade · revisão dos conceitos',
};

interface NoProps {
  no: NoDaTrilha;
  numero: number;
  ultimo: boolean;
  /** Visitante: o nó atual abre a escolha da meta em vez de ir direto à lição. */
  aoAbrirAtual?: () => void;
}

function No({ no, numero, ultimo, aoAbrirAtual }: NoProps) {
  const classeLi = `${estilos.item} ${estilos[`item_${no.tipo}`]} ${ultimo ? estilos.ultimo : ''}`;
  if (no.tipo === 'atual') {
    const verbo = aoAbrirAtual ? 'Começar' : 'Continuar';
    const nome = `${verbo}: ${no.titulo}`;
    return (
      <li class={classeLi}>
        <Marco tipo={no.tipo} numero={numero} />
        <div class={estilos.cartaoAtual}>
          <span class={estilos.capi} aria-hidden="true">
            <Capi tamanho={56} />
          </span>
          <span class={estilos.estado}>{ESTADO_ESCRITO.atual}</span>
          <h3 class={estilos.nomeAtual}>{no.titulo}</h3>
          {no.detalhe && <span class={estilos.detalhe}>{no.detalhe}</span>}
          {aoAbrirAtual ? (
            <button type="button" class={estilos.acao} aria-label={nome} onClick={aoAbrirAtual}>
              {verbo}
            </button>
          ) : (
            <a href={no.destino} class={estilos.acao} aria-label={nome}>
              {verbo}
            </a>
          )}
        </div>
      </li>
    );
  }
  if (no.tipo === 'feita') {
    return (
      <li class={classeLi}>
        <Marco tipo={no.tipo} numero={numero} />
        <a href={no.destino} class={estilos.linha}>
          <span class={estilos.nome}>{no.titulo}</span>{' '}
          <span class={estilos.estado}>{ESTADO_ESCRITO.feita}</span>
        </a>
      </li>
    );
  }
  return (
    <li class={classeLi}>
      <Marco tipo={no.tipo} numero={numero} />
      <button
        type="button"
        class={`${estilos.linha} ${estilos.linhaBloqueada}`}
        aria-disabled="true"
      >
        <span class={estilos.nome}>{no.titulo}</span>{' '}
        <span class={estilos.estado}>{ESTADO_ESCRITO[no.tipo]}</span>
      </button>
    </li>
  );
}

/** A trilha de lições como linha do tempo: marcos ligados por uma linha, com o nome ao lado. */
export function Trilha({ nos, aoAbrirAtual }: { nos: NoDaTrilha[]; aoAbrirAtual?: () => void }) {
  return (
    <ol class={estilos.trilha} aria-label="Trilha de lições">
      {nos.map((no, i) => (
        <No
          key={no.id}
          no={no}
          numero={i + 1}
          ultimo={i === nos.length - 1}
          aoAbrirAtual={aoAbrirAtual}
        />
      ))}
    </ol>
  );
}

export type EstadoBanner = 'feita' | 'atual' | 'bloqueada';

/** Cabeçalho da unidade: branco, com o número, o título e, se houver, o link "Ver o curso". */
export function BannerUnidade({
  numero,
  titulo,
  estado,
  aviso,
  guia,
}: {
  numero: number;
  titulo: string;
  estado: EstadoBanner;
  /** Texto pequeno, ex.: "Libera ao terminar a Unidade 2". */
  aviso?: string | null;
  /** Endereço da página do curso (link "Ver o curso"). */
  guia?: string;
}) {
  return (
    <div class={`${estilos.banner} ${estilos[`banner_${estado}`]}`}>
      <div class={estilos.bannerTexto}>
        <span class={estilos.bannerTag}>
          Unidade {numero}
          {estado === 'feita' && <span> · concluída</span>}
        </span>
        <h2 class={estilos.bannerTitulo}>{titulo}</h2>
        {aviso && <span class={estilos.bannerAviso}>{aviso}</span>}
      </div>
      {guia && (
        <a href={guia} class={estilos.guia}>
          Ver o curso
        </a>
      )}
    </div>
  );
}
