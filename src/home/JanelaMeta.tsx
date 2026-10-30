import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { mostrarAviso } from '../componentes/avisos.ts';
import { Capi } from '../componentes/Capi';
import { Janela } from '../componentes/Janela';
import { catalogo } from '../conteudo/index.ts';
import { primeiraLicaoDoSite } from '../engine/telas.ts';
import type { MetaDiaria } from '../storage/estado.ts';
import { comecarProgresso, estado, mudarMeta } from '../stores/index.ts';
import { fecharMeta, janelaMeta } from '../stores/ui.ts';
import estilos from './home.module.css';

const OPCOES: { valor: MetaDiaria; nome: string; texto: string }[] = [
  { valor: 20, nome: 'Leve', texto: 'Uma prática rápida, cerca de 2 minutos' },
  { valor: 50, nome: 'Regular', texto: 'Cerca de 1 lição por dia' },
  { valor: 100, nome: 'Intenso', texto: 'Cerca de 2 lições por dia' },
];

/** Escolha da meta diária. Montada uma vez no app, abre por `janelaMeta`. */
export function JanelaMeta() {
  const { route } = useLocation();
  const modo = janelaMeta.value;
  const [meta, setMeta] = useState<MetaDiaria>(50);

  // Ao abrir, parte da meta atual (quem muda) ou da Regular (quem começa).
  useEffect(() => {
    if (modo !== 'fechada')
      setMeta(modo === 'mudar' ? (estado.peek()?.config.metaDiaria ?? 50) : 50);
  }, [modo]);

  function confirmar() {
    if (modo === 'mudar') {
      mudarMeta(meta);
      mostrarAviso('Meta atualizada.');
      fecharMeta();
      return;
    }
    const destino = primeiraLicaoDoSite(catalogo);
    fecharMeta();
    comecarProgresso(meta);
    if (destino) route(destino);
    else mostrarAviso('Os primeiros cursos estão chegando. Volte em breve.');
  }

  return (
    <Janela
      titulo="Quanto você quer estudar por dia?"
      aberta={modo !== 'fechada'}
      aoFechar={fecharMeta}
    >
      <div class={estilos.meta}>
        <Capi tamanho={96} />
        <h2>Quanto você quer estudar por dia?</h2>
        <p class={estilos.mudo}>
          Você pode mudar isso depois. A meta soma o XP de todos os cursos.
        </p>
        <fieldset class={estilos.metaOpcoes}>
          <legend class="so-leitor">Meta diária</legend>
          {OPCOES.map((o) => (
            <label key={o.valor} class={estilos.metaOpcao}>
              <input
                type="radio"
                name="meta"
                checked={meta === o.valor}
                onChange={() => setMeta(o.valor)}
              />
              <span class={estilos.metaCaixa}>
                <strong>
                  {o.nome} · {o.valor} XP
                </strong>
                <span>{o.texto}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <Botao3D larga onClick={confirmar}>
          {modo === 'mudar' ? 'Salvar meta' : 'Começar a primeira lição'}
        </Botao3D>
      </div>
    </Janela>
  );
}
