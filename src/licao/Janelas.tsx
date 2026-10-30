import { useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Janela } from '../componentes/Janela';
import type { Card } from '../content-schema/licao.ts';
import estilos from './licao.module.css';
import { TextoComTermos } from './Termo';

export function SairDaLicao({
  aberta,
  aoContinuar,
  aoSair,
  titulo = 'Sair da lição?',
  texto = 'Seu avanço fica salvo. Quando você voltar, continua exatamente de onde parou.',
  rotuloContinuar = 'Continuar a lição',
}: {
  aberta: boolean;
  aoContinuar: () => void;
  aoSair: () => void;
  titulo?: string;
  texto?: string;
  rotuloContinuar?: string;
}) {
  return (
    <Janela titulo={titulo} aberta={aberta} aoFechar={aoContinuar}>
      <div class={estilos.sair}>
        <Capi tamanho={96} />
        <h2>{titulo}</h2>
        <p>{texto}</p>
        <div class={estilos.sairAcoes}>
          <Botao3D larga onClick={aoContinuar}>
            {rotuloContinuar}
          </Botao3D>
          <Botao3D larga variante="neutro" onClick={aoSair}>
            Sair
          </Botao3D>
        </div>
      </div>
    </Janela>
  );
}

/** Os cards da explicação, só para reler: não vale ponto e não mexe na pergunta. */
export function ReverExplicacao({
  cards,
  aberta,
  aoFechar,
}: {
  cards: Card[];
  aberta: boolean;
  aoFechar: () => void;
}) {
  const [i, setI] = useState(0);
  const card = cards[i];
  if (!card) return null;
  return (
    <Janela titulo="Rever explicação" aberta={aberta} aoFechar={aoFechar} larga>
      <div class={estilos.rever}>
        <div class={estilos.reverTopo}>
          <p class={estilos.kicker}>
            Rever explicação · {i + 1} de {cards.length}
          </p>
          <button type="button" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>
        <h2>{card.titulo}</h2>
        <p class={estilos.texto}>
          <TextoComTermos texto={card.texto} glossario={card.glossario} />
        </p>
        {card.analogia && (
          <aside class={estilos.analogia}>
            <Capi tamanho={56} />
            <p>
              <span class={estilos.analogiaRotulo}>Pense assim</span>
              {card.analogia}
            </p>
          </aside>
        )}
        <p class={`${estilos.mudo} ${estilos.fonteFeedback}`}>Fonte: {card.fonte.descricao}</p>
        <div class={estilos.reverNav}>
          <Botao3D variante="neutro" desativado={i === 0} onClick={() => setI(i - 1)}>
            Anterior
          </Botao3D>
          <Botao3D
            variante="neutro"
            desativado={i === cards.length - 1}
            onClick={() => setI(i + 1)}
          >
            Próximo
          </Botao3D>
        </div>
        <Botao3D larga onClick={aoFechar}>
          Voltar à pergunta
        </Botao3D>
        <p class={estilos.mudo} style={{ marginTop: 'var(--espaco-3)', textAlign: 'center' }}>
          Aqui não vale ponto. A sua pergunta continua como estava.
        </p>
      </div>
    </Janela>
  );
}
