import { BarraProgresso } from '../componentes/BarraProgresso';
import { Capi } from '../componentes/Capi';
import { CartaoResultado, ResultadoEmLinha } from '../componentes/CartaoResultado';
import { ehMobile } from '../layouts/mobile.ts';
import type { Exercicio } from '../content-schema/exercicio.ts';
import estilos from './licao.module.css';
import { ArgumentoDoDebate, QuadroDasLeituras, SeloDebate } from './Debate';
import { Classificar, Ordenar } from './NovosTipos';
import { Opcoes } from './Opcoes';
import type { Apresentacao, Marcacao } from './pratica.ts';
import { descreverCerta, descreverMarcacao } from './respostas.ts';
import novos from './novos.module.css';

/** Uma pergunta da Prática, antes e depois de verificar. */
export function PerguntaPratica({
  numero,
  total,
  feitos,
  apresentacao,
  escolha,
  aoEscolher,
  verificado,
  podeRever,
  aoRever,
}: {
  numero: number;
  total: number;
  feitos: number;
  apresentacao: Apresentacao;
  /** O que está marcado agora (em ordenar, já vem com as etapas embaralhadas). */
  escolha: Marcacao | null;
  aoEscolher: (m: Marcacao) => void;
  verificado: boolean;
  podeRever: boolean;
  aoRever: () => void;
}) {
  const ap = apresentacao;
  const mobile = ehMobile.value;
  return (
    <section>
      <div class={estilos.cabecaPratica}>
        <p class={`${estilos.kicker} ${estilos.contador}`} style={{ margin: 0 }}>
          {ap.rotulo} · {numero} de {total}
        </p>
        {podeRever && (
          <button type="button" class={estilos.linkRever} onClick={aoRever}>
            Rever explicação
          </button>
        )}
      </div>
      {!mobile && (
        <div class={estilos.barra}>
          <BarraProgresso valor={(feitos / total) * 100} rotulo="Progresso da prática" />
        </div>
      )}
      {mobile && !(ap.forma === 'opcoes' && ap.balao) ? (
        <div class={`${novos.balaoLinha} ${novos.balaoCompacto}`}>
          <Capi tamanho={72} alt="" />
          <div class={novos.balao}>
            {ap.forma === 'opcoes' && ap.debate && <SeloDebate />}
            <h1>{ap.enunciado}</h1>
          </div>
        </div>
      ) : ap.forma === 'opcoes' && ap.balao ? (
        <div class={`${novos.balaoLinha} ${mobile ? novos.balaoCompacto : ''}`}>
          <Capi tamanho={mobile ? 72 : 110} alt="" />
          <div class={novos.balao}>
            <span class={novos.balaoTopo}>{ap.balao}</span>
            <h1>{ap.enunciado}</h1>
          </div>
        </div>
      ) : (
        <>
          {ap.forma === 'opcoes' && ap.debate && <SeloDebate />}
          <h1 class={estilos.titulo}>{ap.enunciado}</h1>
        </>
      )}
      {ap.forma === 'opcoes' && ap.debate && <ArgumentoDoDebate texto={ap.debate.argumento} />}
      {ap.forma === 'opcoes' && (
        <Opcoes
          nome="pratica"
          legenda={ap.debate ? `${ap.enunciado} “${ap.debate.argumento}”` : ap.enunciado}
          opcoes={ap.opcoes}
          valor={typeof escolha === 'number' ? escolha : null}
          aoEscolher={aoEscolher}
          travado={verificado}
          estados={estadosDasOpcoes(ap.correta, escolha, verificado)}
          grandes={ap.grandes}
          enormes={ap.balao !== undefined}
        />
      )}
      {ap.forma === 'opcoes' && ap.debate && verificado && <QuadroDasLeituras debate={ap.debate} />}
      {ap.forma === 'classificar' && Array.isArray(escolha) && (
        <Classificar ap={ap} valor={escolha} aoMudar={aoEscolher} travado={verificado} />
      )}
      {ap.forma === 'ordenar' && Array.isArray(escolha) && (
        <Ordenar ap={ap} valor={escolha} aoMudar={aoEscolher} travado={verificado} />
      )}
    </section>
  );
}

function estadosDasOpcoes(
  correta: number,
  escolha: Marcacao | null,
  verificado: boolean,
): Record<number, 'certa' | 'errada'> {
  const estados: Record<number, 'certa' | 'errada'> = {};
  if (verificado) {
    estados[correta] = 'certa';
    if (typeof escolha === 'number' && escolha !== correta) estados[escolha] = 'errada';
  }
  return estados;
}

function FonteDoExercicio({ ex }: { ex: Exercicio }) {
  return (
    <p class={estilos.fonteFeedback}>
      Fonte:{' '}
      {ex.fonte.link ? (
        <a href={ex.fonte.link} target="_blank" rel="noopener noreferrer">
          {ex.fonte.descricao}
        </a>
      ) : (
        ex.fonte.descricao
      )}
    </p>
  );
}

/** Título do rodapé colorido: "Mandou bem!" e "Resposta certa: …", ou o do tipo de exercício. */
function tituloDoFeedback(ap: Apresentacao, ok: boolean, xp: number | null): string {
  const pontos = xp !== null && xp > 0 ? ` +${xp} XP` : '';
  if (ok)
    return `${ap.forma === 'opcoes' && ap.tituloCerto ? ap.tituloCerto : 'Mandou bem!'}${pontos}`;
  switch (ap.forma) {
    case 'opcoes':
      return ap.tituloErrado ?? `Resposta certa: ${ap.opcoes[ap.correta] ?? ''}`;
    case 'classificar':
      return 'Quase! Veja onde cada item fica';
    case 'ordenar':
      return 'Quase! A ordem certa é esta';
  }
}

/** Conteúdo do rodapé colorido depois de verificar. */
export function FeedbackPratica({
  ok,
  xp,
  ap,
  ex,
  avisoRevisao = true,
}: {
  ok: boolean;
  /** XP desta resposta; null quando a lição está sendo refeita (não vale XP). */
  xp: number | null;
  ap: Apresentacao;
  ex: Exercicio;
  /** Falso no treino livre, que não mexe no calendário de revisões. */
  avisoRevisao?: boolean;
}) {
  return (
    <>
      <p class={estilos.feedbackTituloPequeno}>{tituloDoFeedback(ap, ok, xp)}</p>
      {!ok && ap.forma === 'ordenar' && (
        <ol class={estilos.ordemCerta}>
          {ap.etapas.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ol>
      )}
      <p>{ex.explicacao}</p>
      <FonteDoExercicio ex={ex} />
      {!ok && avisoRevisao && (
        <p>
          <strong>Essa pergunta volta na sua revisão.</strong>
        </p>
      )}
    </>
  );
}

export interface DadosConcluida {
  xpGanho: number;
  refeita: boolean;
  acertos: number;
  total: number;
  tempo: string;
  novos: { id: string; nome: string; definicao: string }[];
  proxima: string | null;
  cursosLiberados: string[];
}

const CONFETES = ['verde', 'ouro', 'azul', 'coral', 'ouro', 'verde', 'azul', 'coral'] as const;

export function LicaoConcluida({ d, nome }: { d: DadosConcluida; nome: string }) {
  const mobile = ehMobile.value;
  return (
    <section class={estilos.concluida}>
      {mobile ? (
        <div class={estilos.celebracao}>
          {/* Confete só decora: some para o leitor de tela e para quem pede menos movimento. */}
          <span class={estilos.confetes} aria-hidden="true">
            {CONFETES.map((cor, i) => (
              <span key={i} class={`${estilos.confete} ${estilos[`confete-${cor}`]}`} />
            ))}
          </span>
          <span class={estilos.circuloCapi}>
            <Capi tamanho={112} rounded />
          </span>
        </div>
      ) : (
        <Capi tamanho={120} />
      )}
      <h1 class={`${estilos.titulo} ${mobile ? estilos.tituloOuro : ''}`}>Lição concluída!</h1>
      <p class={estilos.texto}>{nome}</p>
      {d.refeita && <p class={estilos.aviso}>Lição refeita. O XP só conta na primeira vez.</p>}
      {mobile ? (
        <ResultadoEmLinha>
          <CartaoResultado rotulo="Total de XP" valor={String(d.xpGanho)} cor="ouro" />
          <CartaoResultado rotulo="Acertos" valor={`${d.acertos} de ${d.total}`} cor="verde" />
          <CartaoResultado rotulo="Tempo" valor={d.tempo} cor="azul" />
        </ResultadoEmLinha>
      ) : (
        <ul class={estilos.numeros}>
          <li class={estilos.numero}>
            <span class={estilos.numeroValor}>{d.xpGanho}</span>
            <span class={estilos.numeroRotulo}>XP ganho</span>
          </li>
          <li class={estilos.numero}>
            <span class={estilos.numeroValor}>
              {d.acertos} de {d.total}
            </span>
            <span class={estilos.numeroRotulo}>Acertos</span>
          </li>
          <li class={estilos.numero}>
            <span class={estilos.numeroValor}>{d.tempo}</span>
            <span class={estilos.numeroRotulo}>Tempo</span>
          </li>
        </ul>
      )}
      {d.novos.length > 0 && (
        <>
          <h2 class={estilos.secao}>
            {d.novos.length} {d.novos.length === 1 ? 'conceito novo' : 'conceitos novos'} no seu
            caderno
          </h2>
          <ul class={estilos.novos}>
            {d.novos.map((c) => (
              <li key={c.id} class={estilos.novo}>
                <strong>{c.nome}</strong>
                <span class={estilos.seloNovo}>Novo</span>
                <p>{c.definicao}</p>
                <p class={estilos.mudo}>Volta para revisão amanhã</p>
              </li>
            ))}
          </ul>
        </>
      )}
      {(d.proxima || d.cursosLiberados.length > 0) && (
        <div class={estilos.desbloqueado}>
          <h2 class={estilos.secao}>Desbloqueado</h2>
          <ul>
            {d.proxima && <li>Próxima lição: {d.proxima}</li>}
            {d.cursosLiberados.map((c) => (
              <li key={c}>Curso liberado: {c}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export interface ErroParaRever {
  numero: number;
  total: number;
  ex: Exercicio;
  apresentacao: Apresentacao;
  marcou: Marcacao;
  conceitos: string[];
}

/** Uma linha de texto ou, quando há várias (classificar e ordenar), uma lista. */
function Linhas({ linhas }: { linhas: string[] }) {
  if (linhas.length === 1) return <>{linhas[0]}</>;
  return (
    <ul class={estilos.linhasResposta}>
      {linhas.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
}

export function ReverErros({ erros }: { erros: ErroParaRever[] }) {
  return (
    <section>
      <span class={estilos.semPontos}>Sem pontos aqui</span>
      <h1 class={estilos.titulo}>O que você errou</h1>
      <p class={estilos.texto}>
        {erros.length} {erros.length === 1 ? 'pergunta' : 'perguntas'}. É só para fixar: aqui
        ninguém ganha nem perde ponto.
      </p>
      <ul class={estilos.erros}>
        {erros.map((e) => (
          <li key={e.numero} class={estilos.erro}>
            <p class={estilos.kicker}>
              {e.apresentacao.rotulo} · Pergunta {e.numero} de {e.total}
            </p>
            <h2>{e.apresentacao.enunciado}</h2>
            {e.apresentacao.forma === 'opcoes' && e.apresentacao.debate && (
              <ArgumentoDoDebate texto={e.apresentacao.debate.argumento} />
            )}
            <div class={estilos.marcou}>
              <span class={estilos.rotuloMini}>Você marcou</span>
              <Linhas linhas={descreverMarcacao(e.apresentacao, e.marcou)} />
            </div>
            <div class={estilos.certaResp}>
              <span class={estilos.rotuloMini}>Resposta certa</span>
              <Linhas linhas={descreverCerta(e.apresentacao)} />
            </div>
            <p>{e.ex.explicacao}</p>
            <FonteDoExercicio ex={e.ex} />
            <ul class={estilos.etiquetas} style={{ justifyContent: 'flex-start' }}>
              {e.conceitos.map((c) => (
                <li key={c} class={estilos.etiqueta}>
                  {c}
                </li>
              ))}
            </ul>
            <p class={estilos.mudo}>Volta na sua revisão amanhã.</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
