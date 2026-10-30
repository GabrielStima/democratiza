import type { Card } from '../content-schema/licao.ts';
import type { Checagem as ChecagemDados } from '../content-schema/exercicio.ts';
import { Capi } from '../componentes/Capi';
import { enderecoDaIssue } from './fluxo.ts';
import estilos from './licao.module.css';
import { Opcoes } from './Opcoes';
import { TextoComTermos } from './Termo';
import { Visual } from './Visual';

export function Situacao({
  texto,
  palpites,
  palpite,
  aoEscolher,
}: {
  texto: string;
  palpites: string[];
  palpite: number | null;
  aoEscolher: (i: number) => void;
}) {
  return (
    <section>
      <p class={estilos.kicker}>Situação</p>
      <h1 class={estilos.titulo}>Primeiro, uma situação. Dê seu palpite, ele não vale ponto.</h1>
      <p class={estilos.texto}>{texto}</p>
      <Opcoes
        nome="palpite"
        legenda="Seu palpite"
        opcoes={palpites}
        valor={palpite}
        aoEscolher={aoEscolher}
      />
    </section>
  );
}

export function CardExplicacao({
  card,
  indice,
  total,
  licaoId,
  rascunho,
}: {
  card: Card;
  indice: number;
  total: number;
  licaoId: string;
  rascunho: boolean;
}) {
  return (
    <article>
      <p class={estilos.kicker}>
        Explicação · {indice + 1} de {total}
      </p>
      <h1 class={estilos.titulo}>{card.titulo}</h1>
      <p class={estilos.texto}>
        <TextoComTermos texto={card.texto} glossario={card.glossario} />
      </p>
      {card.analogia && (
        <aside class={estilos.analogia}>
          <Capi tamanho={64} />
          <p>
            <span class={estilos.analogiaRotulo}>Pense assim</span>
            {card.analogia}
          </p>
        </aside>
      )}
      {card.visual && <Visual nome={card.visual} rascunho={rascunho} />}
      <div class={estilos.rodapeDoCard}>
        <p>
          Fonte:{' '}
          {card.fonte.link ? (
            <a href={card.fonte.link} target="_blank" rel="noopener noreferrer">
              {card.fonte.descricao}
            </a>
          ) : (
            card.fonte.descricao
          )}
        </p>
        <a href={enderecoDaIssue(licaoId, indice)} target="_blank" rel="noopener noreferrer">
          Encontrou um erro?
        </a>
      </div>
    </article>
  );
}

export function Checagem({
  checagem,
  escolha,
  aoEscolher,
  verificado,
  palpite,
}: {
  checagem: ChecagemDados;
  escolha: number | null;
  aoEscolher: (i: number) => void;
  verificado: boolean;
  /** Texto do palpite dado no começo; só aparece na checagem final. */
  palpite: string | null;
}) {
  const acertou = verificado && escolha === checagem.correta;
  const estados: Record<number, 'certa' | 'amarela'> = {};
  if (verificado) {
    estados[checagem.correta] = 'certa';
    if (escolha !== null && !acertou) estados[escolha] = 'amarela';
  }
  return (
    <section>
      <p class={estilos.kicker}>Checagem · não vale ponto</p>
      <h1 class={estilos.titulo}>{checagem.pergunta}</h1>
      <Opcoes
        nome="checagem"
        legenda={checagem.pergunta}
        opcoes={checagem.opcoes}
        valor={escolha}
        aoEscolher={aoEscolher}
        travado={verificado}
        estados={estados}
      />
      <div aria-live="polite">
        {verificado && (
          <div
            class={`${estilos.feedback} ${acertou ? estilos.feedbackCerta : estilos.feedbackQuase}`}
          >
            {!acertou && <Capi tamanho={64} />}
            <div>
              <p class={estilos.feedbackTitulo}>
                {acertou ? 'Isso!' : 'Quase! E tudo bem, aqui não perde ponto.'}
              </p>
              <p>{checagem.reexplicacao}</p>
              {palpite && <p>Seu palpite no começo foi: {palpite}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function FimDaExplicacao({ conceitos }: { conceitos: string[] }) {
  return (
    <section class={estilos.fim}>
      <Capi tamanho={120} />
      <h1 class={estilos.titulo}>Agora é praticar!</h1>
      <p class={estilos.texto}>
        Você viu {conceitos.length} {conceitos.length === 1 ? 'conceito' : 'conceitos'}. Na prática,
        cada acerto vale XP.
      </p>
      <ul class={estilos.etiquetas}>
        {conceitos.map((nome) => (
          <li key={nome} class={estilos.etiqueta}>
            {nome}
          </li>
        ))}
      </ul>
    </section>
  );
}
