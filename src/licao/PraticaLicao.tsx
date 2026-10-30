import { useLocation } from 'preact-iso';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import type { Licao } from '../content-schema/licao.ts';
import { catalogo } from '../conteudo/index.ts';
import { listarLicoes, partirIdLicao } from '../engine/progresso.ts';
import { xpDoAcerto } from '../engine/xp.ts';
import { Licao as LayoutLicao } from '../layouts/Licao';
import { estado, registrarConclusaoLicao } from '../stores/index.ts';
import { gravarAndamento } from './andamento.ts';
import { andamentoDoPasso, fasesConcluidas, fasesDoPasso, type Andamento } from './fluxo.ts';
import { ReverExplicacao, SairDaLicao } from './Janelas';
import {
  apresentar,
  estadoDaPratica,
  formatarTempo,
  indicesSuportados,
  type Resultado,
} from './pratica.ts';
import {
  FeedbackPratica,
  LicaoConcluida,
  PerguntaPratica,
  ReverErros,
  type DadosConcluida,
  type ErroParaRever,
} from './Telas';
import estilos from './licao.module.css';
import { useEscSair } from './useEscSair.ts';

interface Props {
  id: string;
  licao: Licao;
  posicao: string;
  salvo: Andamento | null;
  palpite: number | null;
  /** Volta ao fim da explicação; ausente em lição de desafio. */
  aoVoltar: (() => void) | null;
}

interface Feedback {
  ex: number;
  rep: boolean;
  ok: boolean;
  xp: number;
}

function proximaDepoisDe(id: string): { titulo: string; destino: string } | null {
  const partes = partirIdLicao(id);
  const curso = catalogo.cursos.find((c) => c.id === partes?.cursoId);
  if (!curso) return null;
  const lista = listarLicoes(curso);
  const proxima = lista[lista.findIndex((l) => l.id === id) + 1];
  return proxima
    ? {
        titulo: proxima.licao.titulo,
        destino: `/c/${proxima.cursoId}/${proxima.unidadeId}/${proxima.licaoId}`,
      }
    : null;
}

/** A Prática, a lição concluída e o "rever o que errei". É a única etapa que vale XP. */
export function PraticaLicao({ id, licao, posicao, salvo, palpite, aoVoltar }: Props) {
  const { route } = useLocation();
  const indices = useMemo(() => indicesSuportados(licao), [licao]);
  const refeita = useMemo(() => id in (estado.peek()?.licoesConcluidas ?? {}), [id]);
  const cards = licao.explicacao ?? [];

  const [resultados, setResultados] = useState<Resultado[]>(() => salvo?.pratica?.resultados ?? []);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [conclusao, setConclusao] = useState<{
    dados: DadosConcluida;
    erros: ErroParaRever[];
    destino: string;
  } | null>(null);
  const [vendoErros, setVendoErros] = useState(false);
  const [rever, setRever] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const inicio = useRef(performance.now());
  const topo = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  const ep = estadoDaPratica(indices, resultados);
  const atual = feedback ? { ex: feedback.ex, rep: feedback.rep } : ep.atual;
  const exercicio = atual ? licao.pratica[atual.ex] : undefined;
  const apresentacao = exercicio ? apresentar(exercicio) : null;

  function sair() {
    route('/');
  }
  useEscSair(() => (conclusao ? sair() : setSaindo(true)), saindo || rever);

  function concluir(lista: Resultado[]) {
    const fim = estadoDaPratica(indices, lista);
    const c = registrarConclusaoLicao({
      licaoId: id,
      acertosPrimeira: fim.acertosPrimeira,
      total: fim.total,
      xpBruto: fim.xpBruto,
      conceitosErrados: fim.erradas.flatMap((i) => licao.pratica[i]?.conceitos ?? []),
    });
    const proxima = proximaDepoisDe(id);
    const erros: ErroParaRever[] = fim.erradas.flatMap((ex) => {
      const dado = licao.pratica[ex];
      const ap = dado ? apresentar(dado) : null;
      const resposta = lista.find((r) => r.ex === ex && !r.rep);
      if (!dado || !ap || !resposta) return [];
      return [
        {
          numero: indices.indexOf(ex) + 1,
          total: fim.total,
          ex: dado,
          apresentacao: ap,
          marcou: resposta.m,
          conceitos: dado.conceitos.map((k) => catalogo.conceitos[k]?.nome ?? k),
        },
      ];
    });
    setConclusao({
      dados: {
        xpGanho: c.xpGanho,
        refeita: c.refeita,
        acertos: fim.acertosPrimeira,
        total: fim.total,
        tempo: formatarTempo(fim.segundos),
        novos: c.novosConceitos.flatMap((k) => {
          const dado = catalogo.conceitos[k];
          return dado ? [{ id: k, nome: dado.nome, definicao: dado.definicao }] : [];
        }),
        proxima: proxima?.titulo ?? null,
        cursosLiberados: c.desbloqueios.map((d) => d.titulo),
      },
      erros,
      destino: proxima?.destino ?? `/c/${partirIdLicao(id)?.cursoId ?? ''}`,
    });
  }

  // Quem volta depois de responder tudo (sem ter visto o resultado) cai direto nele.
  const concluiu = useRef(false);
  useEffect(() => {
    if (indices.length > 0 && ep.terminou && !feedback && !conclusao && !concluiu.current) {
      concluiu.current = true;
      concluir(resultados);
    }
  }, []);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    window.scrollTo(0, 0);
    topo.current?.focus();
  }, [feedback === null, vendoErros, conclusao === null]);

  function verificar() {
    if (!atual || !apresentacao || escolha === null) return;
    const ok = escolha === apresentacao.correta;
    const s = Math.min(120, Math.round((performance.now() - inicio.current) / 1000));
    const novos = [...resultados, { ex: atual.ex, ok, rep: atual.rep, m: escolha, s }];
    setResultados(novos);
    setFeedback({ ex: atual.ex, rep: atual.rep, ok, xp: ok ? xpDoAcerto(!atual.rep) : 0 });
    // Grava na hora: a resposta já valeu, recarregar não dá uma segunda chance.
    gravarAndamento(andamentoDoPasso(id, { tipo: 'pratica' }, palpite, { resultados: novos }));
  }

  function continuar() {
    setFeedback(null);
    setEscolha(null);
    inicio.current = performance.now();
    if (estadoDaPratica(indices, resultados).terminou) {
      concluiu.current = true;
      concluir(resultados);
    }
  }

  const aoFechar = () => (conclusao ? sair() : setSaindo(true));
  const modais = (
    <>
      <SairDaLicao aberta={saindo} aoContinuar={() => setSaindo(false)} aoSair={sair} />
      {cards.length > 0 && (
        <ReverExplicacao cards={cards} aberta={rever} aoFechar={() => setRever(false)} />
      )}
    </>
  );
  const comum = {
    posicao,
    nome: licao.titulo,
    rascunho: licao.status === 'rascunho',
    aoFechar,
  };

  if (indices.length === 0) {
    return (
      <LayoutLicao
        {...comum}
        fases={fasesDoPasso([{ tipo: 'pratica' }], 0)}
        rodape={
          <>
            {aoVoltar ? (
              <Botao3D variante="neutro" onClick={aoVoltar}>
                Voltar
              </Botao3D>
            ) : (
              <span />
            )}
          </>
        }
      >
        <section class={estilos.fim}>
          <h1 class={estilos.titulo}>Esta lição ainda não tem exercícios com tela</h1>
          <p class={estilos.texto}>
            Os exercícios dela são de tipos que chegam nos próximos milestones.
          </p>
        </section>
        {modais}
      </LayoutLicao>
    );
  }

  if (conclusao) {
    const { dados, erros, destino } = conclusao;
    return (
      <LayoutLicao
        {...comum}
        fases={fasesConcluidas()}
        rodape={
          vendoErros ? (
            <>
              {cards.length > 0 ? (
                <Botao3D variante="neutro" onClick={() => setRever(true)}>
                  Rever a explicação
                </Botao3D>
              ) : (
                <span />
              )}
              <Botao3D onClick={() => setVendoErros(false)}>Voltar ao resultado</Botao3D>
            </>
          ) : (
            <>
              {erros.length > 0 ? (
                <Botao3D variante="neutro" onClick={() => setVendoErros(true)}>
                  Rever o que errei
                </Botao3D>
              ) : (
                <span />
              )}
              <Botao3D onClick={() => route(destino)}>Continuar</Botao3D>
            </>
          )
        }
      >
        <div ref={topo} tabIndex={-1} style={{ outline: 'none' }}>
          {vendoErros ? (
            <ReverErros erros={erros} />
          ) : (
            <LicaoConcluida d={dados} nome={licao.titulo} />
          )}
        </div>
        {modais}
      </LayoutLicao>
    );
  }

  const noFeedback = feedback !== null;
  return (
    <LayoutLicao
      {...comum}
      fases={fasesDoPasso([{ tipo: 'pratica' }], 0)}
      feedback={
        feedback && exercicio && apresentacao
          ? {
              tom: feedback.ok ? 'certa' : 'errada',
              conteudo: (
                <FeedbackPratica
                  ok={feedback.ok}
                  xp={refeita ? null : feedback.xp}
                  textoCerto={apresentacao.opcoes[apresentacao.correta] ?? ''}
                  ex={exercicio}
                />
              ),
            }
          : undefined
      }
      rodape={
        <>
          <span />
          {noFeedback ? (
            <Botao3D variante={feedback.ok ? 'primario' : 'perigo'} onClick={continuar}>
              Continuar
            </Botao3D>
          ) : (
            <Botao3D desativado={escolha === null} onClick={verificar}>
              Verificar
            </Botao3D>
          )}
        </>
      }
    >
      <div ref={topo} tabIndex={-1} style={{ outline: 'none' }}>
        {apresentacao && (
          <PerguntaPratica
            key={`${atual?.ex}-${atual?.rep}`}
            numero={Math.min(resultados.length - (noFeedback ? 1 : 0) + 1, ep.fila.length)}
            total={ep.fila.length}
            feitos={resultados.length}
            apresentacao={apresentacao}
            escolha={escolha}
            aoEscolher={setEscolha}
            verificado={noFeedback}
            podeRever={cards.length > 0}
            aoRever={() => setRever(true)}
          />
        )}
      </div>
      {modais}
    </LayoutLicao>
  );
}
