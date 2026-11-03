import { useEffect, useRef, useState } from 'preact/hooks';
import type { ApresentacaoClassificar, ApresentacaoOrdenar } from './pratica.ts';
import { ordemDosItens } from './respostas.ts';
import estilos from './novos.module.css';

/** O foco está em algum elemento (não se perdeu na página com a troca de botões). */
function foiParaOutroLugar(): boolean {
  const ativo = document.activeElement;
  return ativo !== null && ativo !== document.body;
}

interface PropsComuns<A, V> {
  ap: A;
  valor: V;
  aoMudar: (v: V) => void;
  /** Depois de verificar: nada mais muda e cada linha mostra se está certa. */
  travado: boolean;
}

/**
 * Classificar: escolhe-se um item solto e depois a categoria onde ele fica. Tudo é botão
 * de verdade, então Tab, Enter e Espaço bastam (arrastar e soltar não é necessário).
 */
export function Classificar({
  ap,
  valor,
  aoMudar,
  travado,
}: PropsComuns<ApresentacaoClassificar, number[]>) {
  const [sel, setSel] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const soltos = useRef<HTMLDivElement>(null);
  const [devolver, setDevolver] = useState(0);
  const ordem = ordemDosItens(ap);
  const pool = ordem.filter((i) => valor[i] === -1);

  // O botão que a pessoa acabou de usar sumiu e o foco caiu na página: volta para a lista de
  // itens soltos. Se o foco já está em outro lugar, não se mexe nele.
  useEffect(() => {
    if (devolver > 0 && !foiParaOutroLugar()) soltos.current?.focus();
  }, [devolver]);

  const mudar = (i: number, categoria: number) => {
    const novo = [...valor];
    novo[i] = categoria;
    aoMudar(novo);
    setDevolver((n) => n + 1);
  };

  function colocar(categoria: number) {
    if (sel === null || travado) return;
    mudar(sel, categoria);
    setAviso(`“${ap.itens[sel]?.texto}” colocado em ${ap.categorias[categoria]?.nome}.`);
    setSel(null);
  }

  function devolverItem(i: number) {
    if (travado) return;
    mudar(i, -1);
    setAviso(`“${ap.itens[i]?.texto}” voltou para os itens soltos.`);
  }

  const escolhido = sel !== null ? ap.itens[sel] : undefined;
  return (
    <div class={estilos.classificar}>
      <p class={estilos.instrucao}>
        Escolha um item e depois toque na categoria onde ele fica. Para trocar, toque no item já
        colocado.
      </p>
      <div
        ref={soltos}
        tabIndex={-1}
        class={estilos.soltos}
        role="group"
        aria-label="Itens ainda sem categoria"
      >
        {pool.map((i) => (
          <button
            key={i}
            type="button"
            class={`${estilos.item} ${sel === i ? estilos.itemEscolhido : ''}`}
            aria-pressed={sel === i}
            disabled={travado}
            onClick={() => setSel(sel === i ? null : i)}
          >
            {ap.itens[i]?.texto}
          </button>
        ))}
        {pool.length === 0 && <span class={estilos.todas}>Todos colocados.</span>}
      </div>
      <p class="so-leitor" role="status">
        {aviso}
      </p>
      <div class={estilos.zonas}>
        {ap.categorias.map((cat, c) => (
          <section key={c} class={`${estilos.zona} ${estilos[`zona${c % 4}`] ?? ''}`}>
            <h2 class={estilos.zonaNome}>{cat.nome}</h2>
            <p class={estilos.zonaDica}>{cat.dica}</p>
            <ul class={estilos.colocados} aria-label={`Itens em ${cat.nome}`}>
              {ordem
                .filter((i) => valor[i] === c)
                .map((i) => {
                  const certo = ap.itens[i]?.categoria === c;
                  const classe = !travado ? '' : certo ? estilos.itemCerto : estilos.itemErrado;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        class={`${estilos.item} ${estilos.itemColocado} ${classe}`}
                        disabled={travado}
                        onClick={() => devolverItem(i)}
                      >
                        <span>{ap.itens[i]?.texto}</span>
                        {travado && (
                          <span class={estilos.marcaItem}>
                            {certo
                              ? 'Certo'
                              : `Era em ${ap.categorias[ap.itens[i]?.categoria ?? 0]?.nome ?? ''}`}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
            {escolhido && !travado && (
              <button type="button" class={estilos.colocar} onClick={() => colocar(c)}>
                Colocar “{escolhido.texto}” aqui
              </button>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

const SETA_CIMA = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);
const SETA_BAIXO = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Ordenar: cada etapa tem os botões de subir e descer, nas pontas o botão fica desativado. */
export function Ordenar({
  ap,
  valor,
  aoMudar,
  travado,
}: PropsComuns<ApresentacaoOrdenar, number[]>) {
  const [aviso, setAviso] = useState('');
  const [foco, setFoco] = useState<{
    etapa: number;
    sentido: 'sobe' | 'desce';
    vez: number;
  } | null>(null);
  const lista = useRef<HTMLOListElement>(null);

  // Mover a linha recria o botão no DOM; devolve o foco ao mesmo botão (ou ao outro, na ponta).
  useEffect(() => {
    if (!foco) return;
    const botoes = lista.current?.querySelectorAll<HTMLButtonElement>(
      `[data-etapa="${foco.etapa}"]`,
    );
    const quer = [...(botoes ?? [])].find((b) => b.dataset.sentido === foco.sentido);
    const outro = [...(botoes ?? [])].find((b) => b.dataset.sentido !== foco.sentido);
    if (!foiParaOutroLugar()) (quer && !quer.disabled ? quer : outro)?.focus();
  }, [foco]);

  function mover(pos: number, d: -1 | 1) {
    const alvo = pos + d;
    if (travado || alvo < 0 || alvo >= valor.length) return;
    const novo = [...valor];
    [novo[pos], novo[alvo]] = [novo[alvo] as number, novo[pos] as number];
    aoMudar(novo);
    const etapa = valor[pos] as number;
    setFoco({ etapa, sentido: d < 0 ? 'sobe' : 'desce', vez: (foco?.vez ?? 0) + 1 });
    setAviso(`“${ap.etapas[etapa]}” agora é a ${alvo + 1}ª de ${valor.length}.`);
  }

  return (
    <div class={estilos.ordenar}>
      <p class={estilos.instrucao}>
        Use as setas para subir ou descer cada etapa. A primeira etapa fica no alto.
      </p>
      <p class="so-leitor" role="status">
        {aviso}
      </p>
      <ol ref={lista} class={estilos.etapas} aria-label="Etapas para ordenar">
        {valor.map((etapa, pos) => {
          const certa = etapa === pos;
          const texto = ap.etapas[etapa] ?? '';
          return (
            <li
              key={etapa}
              class={`${estilos.etapa} ${travado ? (certa ? estilos.etapaCerta : estilos.etapaErrada) : ''}`}
            >
              <span class={estilos.numero} aria-hidden="true">
                {pos + 1}
              </span>
              <span class={estilos.etapaTexto}>{texto}</span>
              {travado && (
                <span class={estilos.marcaEtapa}>
                  {certa ? <span class="so-leitor">Na posição certa</span> : `era a ${etapa + 1}ª`}
                </span>
              )}
              {!travado && (
                <div class={estilos.setas}>
                  <button
                    type="button"
                    class={estilos.seta}
                    data-etapa={etapa}
                    data-sentido="sobe"
                    aria-label={`Subir: ${texto}`}
                    disabled={pos === 0}
                    onClick={() => mover(pos, -1)}
                  >
                    {SETA_CIMA}
                  </button>
                  <button
                    type="button"
                    class={estilos.seta}
                    data-etapa={etapa}
                    data-sentido="desce"
                    aria-label={`Descer: ${texto}`}
                    disabled={pos === valor.length - 1}
                    onClick={() => mover(pos, 1)}
                  >
                    {SETA_BAIXO}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
