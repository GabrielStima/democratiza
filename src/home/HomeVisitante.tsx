import { useEffect, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Cartao } from '../componentes/Cartao';
import { catalogo, carregarLicao } from '../conteudo/index.ts';
import { listarLicoes } from '../engine/progresso.ts';
import { Opcoes } from '../licao/Opcoes';
import { apresentar, type Apresentacao } from '../licao/pratica.ts';
import { PRINCIPIOS } from '../textos/principios.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './home.module.css';

const CONFIANCA = [
  'Gratuito',
  'Sem cadastro',
  'Apartidário',
  'Fonte em tudo',
  'Funciona até sem internet',
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
  const estados: Record<number, 'certa' | 'errada'> = {};
  if (respondeu) {
    estados[apresentacao.correta] = 'certa';
    if (!certa && escolha !== null) estados[escolha] = 'errada';
  }
  return (
    <Cartao class={estilos.pergunta}>
      <p class={estilos.kicker}>Experimente agora</p>
      <h2>{apresentacao.enunciado}</h2>
      <Opcoes
        nome="pergunta-rapida"
        legenda={apresentacao.enunciado}
        opcoes={apresentacao.opcoes}
        valor={escolha}
        aoEscolher={setEscolha}
        travado={respondeu}
        estados={estados}
        grandes={apresentacao.grandes}
      />
      <div aria-live="polite">
        {respondeu && (
          <p class={estilos.resposta}>
            <strong>{certa ? 'Isso!' : 'Quase!'}</strong> {pergunta.explicacao}
          </p>
        )}
      </div>
    </Cartao>
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
        <div>
          <h1>Entenda a política do Brasil em 5 minutos por dia.</h1>
          <p class={estilos.lead}>
            Lições curtas, prática e revisão, no estilo dos aplicativos de idiomas. Gratuito,
            apartidário e com fonte em tudo.
          </p>
          <div class={estilos.acoes}>
            <Botao3D onClick={comecar}>Começar agora</Botao3D>
            <Botao3D
              variante="neutro"
              onClick={() =>
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Como funciona
            </Botao3D>
          </div>
        </div>
        {pergunta ? <PerguntaRapida pergunta={pergunta} /> : <Capi tamanho={220} />}
      </section>

      <ul class={estilos.confianca} aria-label="Em resumo">
        {CONFIANCA.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

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
  );
}
