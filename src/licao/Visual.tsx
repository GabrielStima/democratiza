import type { ComponentType } from 'preact';
import estilos from './licao.module.css';

function LoremEsquema() {
  return (
    <div class={estilos.visual} role="img" aria-label="Esquema de exemplo">
      Esquema de exemplo
    </div>
  );
}

/** Esquemas visuais que os cards podem pedir pelo nome (`visual` no JSON). */
export const VISUAIS: Record<string, ComponentType> = {
  'lorem-esquema': LoremEsquema,
};

/** Em rascunho, um nome sem componente aparece como quadro cinza; em lição revisada o build já recusa. */
export function Visual({ nome, rascunho }: { nome: string; rascunho: boolean }) {
  const Componente = VISUAIS[nome];
  if (Componente) return <Componente />;
  if (!rascunho) return null;
  return <div class={estilos.visual}>Visual desconhecido: {nome}</div>;
}
