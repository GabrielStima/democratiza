import type { ComponentChildren } from 'preact';
import type { Fase } from '../licao/fluxo.ts';
import estilos from './Licao.module.css';

interface Props {
  /** "Unidade 1 · Lição 2" */
  posicao: string;
  nome: string;
  rascunho: boolean;
  /** Ausente na Revisão, que não tem fases. */
  fases?: Fase[];
  /** Tela final sem o topo (Revisão concluída). */
  semTopo?: boolean;
  aoFechar: () => void;
  /** Botões do rodapé (Voltar e o principal). */
  rodape: ComponentChildren;
  /** Resposta da Prática: pinta o rodapé inteiro e mostra o feedback acima dos botões. */
  feedback?: { tom: 'certa' | 'errada'; conteudo: ComponentChildren };
  children: ComponentChildren;
}

/** Layout da lição: sem menu, com topo próprio, fases e rodapé com os botões. */
export function Licao({
  posicao,
  nome,
  rascunho,
  fases = [],
  semTopo = false,
  aoFechar,
  rodape,
  feedback,
  children,
}: Props) {
  return (
    <div class={estilos.pagina}>
      {rascunho && <div class={estilos.faixa}>Rascunho</div>}
      {!semTopo && (
        <header class={estilos.topo}>
          <div class={estilos.interno}>
            <button
              type="button"
              class={estilos.fechar}
              aria-label="Sair da lição"
              onClick={aoFechar}
            >
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
            </button>
            <div class={estilos.identidade}>
              <span class={estilos.posicao}>{posicao}</span>
              <span class={estilos.nome}>{nome}</span>
            </div>
            {fases.length > 0 && (
              <ol class={estilos.fases} aria-label="Fases da lição">
                {fases.map((f) => (
                  <li
                    key={f.rotulo}
                    class={`${estilos.fase} ${estilos[f.estado]}`}
                    aria-current={f.estado === 'atual' ? 'step' : undefined}
                  >
                    {f.estado === 'feita' && <span aria-hidden="true">✓ </span>}
                    {f.rotulo}
                    {f.estado === 'feita' && <span class="so-leitor"> (concluída)</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </header>
      )}
      <main class={estilos.principal}>{children}</main>
      <footer class={`${estilos.rodape} ${feedback ? estilos[feedback.tom] : ''}`}>
        {feedback && (
          <div class={estilos.feedback} aria-live="polite">
            {feedback.conteudo}
          </div>
        )}
        <div class={estilos.rodapeInterno}>{rodape}</div>
      </footer>
    </div>
  );
}
