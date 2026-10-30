import { BarraProgresso } from '../componentes/BarraProgresso';
import { Capi } from '../componentes/Capi';
import type { Exercicio } from '../content-schema/exercicio.ts';
import estilos from './licao.module.css';
import { Opcoes } from './Opcoes';
import type { Apresentacao } from './pratica.ts';

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
  escolha: number | null;
  aoEscolher: (i: number) => void;
  verificado: boolean;
  podeRever: boolean;
  aoRever: () => void;
}) {
  const estados: Record<number, 'certa' | 'errada'> = {};
  if (verificado) {
    estados[apresentacao.correta] = 'certa';
    if (escolha !== null && escolha !== apresentacao.correta) estados[escolha] = 'errada';
  }
  return (
    <section>
      <div class={estilos.cabecaPratica}>
        <p class={`${estilos.kicker} ${estilos.contador}`} style={{ margin: 0 }}>
          {apresentacao.rotulo} · {numero} de {total}
        </p>
        {podeRever && (
          <button type="button" class={estilos.linkRever} onClick={aoRever}>
            Rever explicação
          </button>
        )}
      </div>
      <div class={estilos.barra}>
        <BarraProgresso valor={(feitos / total) * 100} rotulo="Progresso da prática" />
      </div>
      <h1 class={estilos.titulo}>{apresentacao.enunciado}</h1>
      <Opcoes
        nome="pratica"
        legenda={apresentacao.enunciado}
        opcoes={apresentacao.opcoes}
        valor={escolha}
        aoEscolher={aoEscolher}
        travado={verificado}
        estados={estados}
        grandes={apresentacao.grandes}
      />
    </section>
  );
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

/** Conteúdo do rodapé colorido depois de verificar. */
export function FeedbackPratica({
  ok,
  xp,
  textoCerto,
  ex,
  avisoRevisao = true,
}: {
  ok: boolean;
  /** XP desta resposta; null quando a lição está sendo refeita (não vale XP). */
  xp: number | null;
  textoCerto: string;
  ex: Exercicio;
  /** Falso no treino livre, que não mexe no calendário de revisões. */
  avisoRevisao?: boolean;
}) {
  return ok ? (
    <>
      <p class={estilos.feedbackTituloPequeno}>
        Mandou bem!{xp !== null && xp > 0 ? ` +${xp} XP` : ''}
      </p>
      <p>{ex.explicacao}</p>
      <FonteDoExercicio ex={ex} />
    </>
  ) : (
    <>
      <p class={estilos.feedbackTituloPequeno}>Resposta certa: {textoCerto}</p>
      <p>{ex.explicacao}</p>
      <FonteDoExercicio ex={ex} />
      {avisoRevisao && (
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

export function LicaoConcluida({ d, nome }: { d: DadosConcluida; nome: string }) {
  return (
    <section class={estilos.concluida}>
      <Capi tamanho={120} />
      <h1 class={estilos.titulo}>Lição concluída!</h1>
      <p class={estilos.texto}>{nome}</p>
      {d.refeita && <p class={estilos.aviso}>Lição refeita. O XP só conta na primeira vez.</p>}
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
  marcou: number;
  conceitos: string[];
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
            <p class={estilos.marcou}>
              <span class={estilos.rotuloMini}>Você marcou</span>
              {e.apresentacao.opcoes[e.marcou]}
            </p>
            <p class={estilos.certaResp}>
              <span class={estilos.rotuloMini}>Resposta certa</span>
              {e.apresentacao.opcoes[e.apresentacao.correta]}
            </p>
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
