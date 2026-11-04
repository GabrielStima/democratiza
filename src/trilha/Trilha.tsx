import type { JSX } from 'preact';
import { Capi } from '../componentes/Capi';
import { deslocamento, rotuloDoNo, type NoDaTrilha, type TipoNo } from './nos.ts';
import estilos from './trilha.module.css';

const ICONES: Record<TipoNo, JSX.Element> = {
  feita: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  atual: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
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

function Icone({ tipo }: { tipo: TipoNo }) {
  const cheio = tipo === 'atual';
  return (
    <svg
      aria-hidden="true"
      width={tipo === 'feita' ? 36 : 32}
      height={tipo === 'feita' ? 36 : 32}
      viewBox="0 0 24 24"
      fill={cheio ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width={tipo === 'feita' ? 4.2 : 2.6}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {ICONES[tipo]}
    </svg>
  );
}

interface NoProps {
  no: NoDaTrilha;
  indice: number;
  /** Visitante: o nó atual abre a escolha da meta em vez de ir direto à lição. */
  aoAbrirAtual?: () => void;
}

function No({ no, indice, aoAbrirAtual }: NoProps) {
  const desloc = deslocamento(indice);
  const rotulo = rotuloDoNo(no);
  const atual = no.tipo === 'atual';
  const bloqueado = no.tipo === 'bloqueada' || no.tipo === 'desafio';
  const circulo = (
    <span class={`${estilos.circulo} ${estilos[no.tipo]}`}>
      <Icone tipo={no.tipo} />
    </span>
  );
  const corpo = (
    <span class={estilos.no} style={{ transform: `translateX(${desloc}px)` }}>
      {atual && (
        <span class={estilos.balao} aria-hidden="true">
          Começar
        </span>
      )}
      {atual ? <span class={estilos.anel}>{circulo}</span> : circulo}
    </span>
  );
  let controle;
  if (bloqueado) {
    controle = (
      <button type="button" class={estilos.controle} aria-disabled="true" aria-label={rotulo}>
        {corpo}
      </button>
    );
  } else if (atual && aoAbrirAtual) {
    controle = (
      <button type="button" class={estilos.controle} aria-label={rotulo} onClick={aoAbrirAtual}>
        {corpo}
      </button>
    );
  } else {
    controle = (
      <a href={no.destino} class={estilos.controle} aria-label={rotulo}>
        {corpo}
      </a>
    );
  }
  return (
    <li class={`${estilos.item} ${atual ? estilos.itemAtual : ''}`}>
      {controle}
      {atual && (
        <span
          class={`${estilos.capi} ${desloc <= 0 ? estilos.capiDireita : estilos.capiEsquerda}`}
          aria-hidden="true"
        >
          <Capi tamanho={92} />
        </span>
      )}
    </li>
  );
}

/** A trilha de lições: nós em zigue-zague. `inicio` continua o desenho de uma trilha anterior. */
export function Trilha({
  nos,
  inicio = 0,
  aoAbrirAtual,
}: {
  nos: NoDaTrilha[];
  inicio?: number;
  aoAbrirAtual?: () => void;
}) {
  return (
    <ol class={estilos.trilha} aria-label="Trilha de lições">
      {nos.map((no, i) => (
        <No key={no.id} no={no} indice={inicio + i} aoAbrirAtual={aoAbrirAtual} />
      ))}
    </ol>
  );
}

export type EstadoBanner = 'feita' | 'atual' | 'bloqueada';

/** Faixa da unidade: verde na atual (e na feita, com ✓), cinza na bloqueada. */
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
  /** Endereço do guia da unidade (botão com ícone de livro). */
  guia?: string;
}) {
  return (
    <div class={`${estilos.banner} ${estilos[`banner_${estado}`]}`}>
      <div class={estilos.bannerTexto}>
        <span class={estilos.bannerTag}>
          {estado === 'feita' && (
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          )}
          Unidade {numero}
          {estado === 'feita' && <span> · concluída</span>}
        </span>
        <h2 class={estilos.bannerTitulo}>{titulo}</h2>
        {aviso && <span class={estilos.bannerAviso}>{aviso}</span>}
      </div>
      {guia && (
        <a href={guia} class={estilos.guia} aria-label={`Guia da unidade ${numero}`}>
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
            <path d="M8 7h6M8 11h6" />
          </svg>
        </a>
      )}
    </div>
  );
}
