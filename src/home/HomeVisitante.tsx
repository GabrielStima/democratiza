import { useEffect, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Cartao } from '../componentes/Cartao';
import { catalogo, carregarLicao } from '../conteudo/index.ts';
import { listarLicoes } from '../engine/progresso.ts';
import { apresentar, type Apresentacao } from '../licao/pratica.ts';
import { PRINCIPIOS } from '../textos/principios.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './home.module.css';

const ICONES_CONFIANCA = {
  escudo: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />,
  livro: (
    <>
      <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h6" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  celular: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
};

const CONFIANCA: { icone: keyof typeof ICONES_CONFIANCA; texto: string }[] = [
  { icone: 'escudo', texto: 'Sem lado: explica, não opina' },
  { icone: 'livro', texto: 'Baseado em fontes oficiais' },
  { icone: 'cadeado', texto: 'Sem cadastro e sem anúncios' },
  { icone: 'celular', texto: 'Funciona até sem internet' },
];

const PASSOS = [
  {
    titulo: 'Comece pela Introdução',
    texto: 'Os outros cursos são liberados conforme você aprende os conceitos que eles pedem.',
  },
  {
    titulo: 'Entenda, depois pratique',
    texto: 'Cada lição parte de uma situação, explica com fonte e termina com exercícios.',
  },
  {
    titulo: 'Mantenha a ofensiva',
    texto: 'Estude um pouco por dia e acompanhe sua meta e seus dias seguidos.',
  },
];

const GAMIFICACAO = [
  { titulo: 'Ofensiva', texto: 'Dias seguidos estudando' },
  { titulo: 'XP', texto: 'Cada acerto na prática vale pontos' },
  { titulo: 'Revisão', texto: 'A Capi traz o conceito de volta' },
  { titulo: 'Caderno', texto: 'Cada conceito aprendido vira um cartão seu' },
];

interface Pergunta {
  apresentacao: Apresentacao;
  explicacao: string;
}

/** Uma pergunta de verdade, tirada da primeira lição do catálogo. */
function usePerguntaRapida(): Pergunta | null {
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  useEffect(() => {
    const primeira = catalogo.cursos[0] ? listarLicoes(catalogo.cursos[0])[0] : undefined;
    if (!primeira) return;
    let ativo = true;
    void carregarLicao(primeira.cursoId, primeira.unidadeId, primeira.licaoId)
      .then((licao) => {
        for (const ex of licao?.pratica ?? []) {
          const apresentacao = apresentar(ex);
          if (apresentacao && ativo) {
            setPergunta({ apresentacao, explicacao: ex.explicacao });
            return;
          }
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);
  return pergunta;
}

function PerguntaRapida({ pergunta }: { pergunta: Pergunta }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const { apresentacao } = pergunta;
  const respondeu = escolha !== null;
  const certa = escolha === apresentacao.correta;
  const estadoDe = (i: number): string => {
    if (!respondeu) return '';
    if (i === apresentacao.correta) return estilos.opcaoCerta ?? '';
    return i === escolha ? (estilos.opcaoErrada ?? '') : '';
  };
  return (
    <div class={estilos.pergunta}>
      <p class={estilos.kickerAzul}>Pergunta rápida</p>
      <fieldset class={estilos.rapida}>
        <legend>{apresentacao.enunciado}</legend>
        <div class={estilos.opcoesRapidas}>
          {apresentacao.opcoes.map((texto, i) => (
            <label key={i} class={`${estilos.opcaoRapida} ${estadoDe(i)}`}>
              <input
                type="radio"
                name="pergunta-rapida"
                checked={escolha === i}
                disabled={respondeu}
                onChange={() => setEscolha(i)}
              />
              <span>{texto}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div aria-live="polite">
        {respondeu && (
          <p class={estilos.resposta}>
            <strong>{certa ? 'Isso!' : 'Quase!'}</strong> {pergunta.explicacao}
          </p>
        )}
      </div>
    </div>
  );
}

/** Home de quem ainda não tem progresso salvo. */
export function HomeVisitante() {
  const pergunta = usePerguntaRapida();
  const unidades = catalogo.cursos[0]?.unidades ?? [];
  const comecar = () => abrirMeta('primeira');
  return (
    <div class={estilos.home}>
      <section class={estilos.heroi}>
        <div class={estilos.heroiInterno}>
          <div class={estilos.heroiTexto}>
            <span class={estilos.selo}>Grátis · apartidário · sem cadastro</span>
            <h1>Entenda a política do Brasil em 5 minutos por dia.</h1>
            <p class={estilos.lead}>
              Lições curtas, perguntas rápidas e muita prática para você descobrir como funcionam os
              Três Poderes, o seu voto, a Constituição e o dinheiro público. Quem ensina é a Capi,
              uma capivara que leu a Constituição inteira.
            </p>
            <div class={estilos.acoes}>
              <Botao3D tamanho="grande" onClick={comecar}>
                Começar agora
              </Botao3D>
              <Botao3D
                tamanho="grande"
                variante="neutro"
                onClick={() =>
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Como funciona
              </Botao3D>
            </div>
            <p class={estilos.nota}>Seu progresso fica salvo no seu próprio navegador.</p>
          </div>
          <div class={estilos.vitrine}>
            <div class={estilos.painelCapi}>
              <Capi class={estilos.capiGrande} tamanho={340} alt="Capi, a capivara mascote" />
            </div>
            {pergunta && <PerguntaRapida pergunta={pergunta} />}
          </div>
        </div>
      </section>

      <section class={estilos.faixaConfianca} aria-label="Em resumo">
        <ul class={estilos.confianca}>
          {CONFIANCA.map((c) => (
            <li key={c.texto}>
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                {ICONES_CONFIANCA[c.icone]}
              </svg>
              {c.texto}
            </li>
          ))}
        </ul>
      </section>

      <div class={estilos.conteudo}>
        <section id="como-funciona" class={estilos.secao}>
          <h2>Como funciona</h2>
          <ol class={estilos.passos}>
            {PASSOS.map((p, i) => (
              <li key={p.titulo}>
                <span class={estilos.numeroPasso}>{i + 1}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {unidades.length > 0 && (
          <section class={estilos.secao}>
            <h2>O que você vai aprender</h2>
            <ul class={estilos.unidades}>
              {unidades.map((u, i) => (
                <li key={u.id}>
                  <Cartao>
                    <p class={estilos.kicker}>Unidade {i + 1}</p>
                    <h3>{u.titulo}</h3>
                    <p>{u.descricao}</p>
                  </Cartao>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section class={estilos.secao}>
          <h2>Aprender sem esquecer</h2>
          <ul class={estilos.gamificacao}>
            {GAMIFICACAO.map((g) => (
              <li key={g.titulo}>
                <h3>{g.titulo}</h3>
                <p>{g.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section class={estilos.secao}>
          <h2>Nossos princípios</h2>
          <ul class={estilos.principios}>
            {PRINCIPIOS.map((p) => (
              <li key={p.titulo}>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section class={estilos.final}>
          <Capi tamanho={96} />
          <h2>Comece agora, é de graça.</h2>
          <Botao3D onClick={comecar}>Começar agora</Botao3D>
        </section>
      </div>
    </div>
  );
}
