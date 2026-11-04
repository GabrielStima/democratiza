import type { ComponentChildren } from 'preact';
import type { Fase } from '../licao/fluxo.ts';
import { BarraProgressoGrossa } from '../componentes/BarraProgressoGrossa';
import estilos from './Licao.module.css';
import { ehMobile } from './mobile.ts';

/** Progresso do topo no celular, calculado das fases (cada fase feita vale 25%). */
export function progressoDasFases(fases: Fase[]): number {
  if (fases.length === 0) return 0;
  if (fases.every((f) => f.estado === 'feita')) return 100;
  return Math.round((fases.filter((f) => f.estado === 'feita').length / fases.length) * 100) + 8;
}

interface Props {
  /** "Unidade 1 · Lição 2" */
  posicao: string;
  nome: string;
  rascunho: boolean;
  /** Ausente na Revisão, que não tem fases. */
  fases?: Fase[];
  /** Tela final sem o topo (Revisão concluída). */
  semTopo?: boolean;
  /** Celular: avanço da barra grossa (0 a 100). Sem isso, vem das fases. */
  progresso?: number;
  /** Celular: texto da barra para leitor de tela, ex.: "Exercício 3 de 6". */
  rotuloProgresso?: string;
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
  progresso,
  rotuloProgresso,
  aoFechar,
  rodape,
  feedback,
  children,
}: Props) {
  return (
    <div class={estilos.pagina}>
      {rascunho && <div class={estilos.faixa}>Rascunho</div>}
      {!semTopo && ehMobile.value && (
        <header class={estilos.topoMobile}>
          <button
            type="button"
            class={estilos.fechar}
            aria-label="Sair da lição"
            onClick={aoFechar}
          >
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3.2"
              stroke-linecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <BarraProgressoGrossa
            valor={progresso ?? progressoDasFases(fases)}
            rotulo={`${posicao} · ${nome}${rotuloProgresso ? ` · ${rotuloProgresso}` : ''}`}
          />
        </header>
      )}
      {!semTopo && !ehMobile.value && (
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
