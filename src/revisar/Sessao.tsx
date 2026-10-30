import { useLocation, useRoute } from 'preact-iso';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { catalogo, carregarLicao } from '../conteudo/index.ts';
import { partirIdLicao } from '../engine/progresso.ts';
import { hoje } from '../engine/relogio.ts';
import { selecionarSessao } from '../engine/revisao.ts';
import { conceitosDoTreino } from '../engine/telasRevisao.ts';
import { xpDoAcerto } from '../engine/xp.ts';
import { Licao as LayoutLicao } from '../layouts/Licao';
import { SairDaLicao } from '../licao/Janelas';
import { formatarTempo } from '../licao/pratica.ts';
import { FeedbackPratica, PerguntaPratica } from '../licao/Telas';
import { useEscSair } from '../licao/useEscSair.ts';
import { caderno, carregado, registrarConclusaoRevisao } from '../stores/index.ts';
import { Concluida, type DadosFim, type ModoSessao } from './Concluida';
import {
  escolherExercicio,
  exerciciosDoConceito,
  licoesDoConceito,
  type ItemSessao,
  type LicaoCarregada,
} from './montar.ts';
import estilos from './revisar.module.css';

interface Resposta {
  ok: boolean;
  escolha: number;
  s: number;
}

const NOMES: Record<ModoSessao, { posicao: string; nome: string }> = {
  revisao: { posicao: 'Revisão', nome: 'Revisão de hoje' },
  treino: { posicao: 'Treino livre', nome: 'Treino' },
  conceito: { posicao: 'Praticar', nome: 'Praticar agora' },
};

const SAIR: Record<ModoSessao, { titulo: string; texto: string; continuar: string }> = {
  revisao: {
    titulo: 'Sair da revisão?',
    texto:
      'Os conceitos desta sessão continuam esperando por você. Só vale quando você chega ao fim.',
    continuar: 'Continuar a revisão',
  },
  treino: {
    titulo: 'Sair do treino?',
    texto: 'Esse treino não vale XP e não muda o seu calendário de revisões.',
    continuar: 'Continuar o treino',
  },
  conceito: {
    titulo: 'Sair da prática?',
    texto: 'Praticar um conceito não muda o seu calendário de revisões.',
    continuar: 'Continuar a prática',
  },
};

/** Baixa as lições dos conceitos e monta as perguntas da sessão. */
async function montarItens(modo: ModoSessao, ids: string[]): Promise<ItemSessao[]> {
  const doConceito = new Map(
    ids.map((id) => [id, licoesDoConceito(catalogo, id, caderno.peek()[id]?.licaoId)]),
  );
  const unicas = [...new Set([...doConceito.values()].flat())];
  const carregadas = new Map<string, LicaoCarregada>();
  await Promise.all(
    unicas.map(async (id) => {
      const p = partirIdLicao(id);
      const licao = p ? await carregarLicao(p.cursoId, p.unidadeId, p.licaoId) : null;
      if (licao) carregadas.set(id, { id, licao });
    }),
  );
  const dia = hoje();
  return ids.flatMap((id) => {
    const licoes = (doConceito.get(id) ?? []).flatMap((l) => {
      const c = carregadas.get(l);
      return c ? [c] : [];
    });
    if (modo === 'conceito') return exerciciosDoConceito(id, licoes);
    const item = escolherExercicio(id, licoes, dia);
    return item ? [item] : [];
  });
}

function conceitosDaRota(modo: ModoSessao, chave: string): string[] {
  if (modo === 'revisao') return selecionarSessao(caderno.peek(), hoje()).map((e) => e.conceitoId);
  if (modo === 'treino') return conceitosDoTreino(caderno.peek(), catalogo, chave);
  return caderno.peek()[chave] ? [chave] : [];
}

function Mensagem({ texto, voltar }: { texto: string; voltar?: { href: string; rotulo: string } }) {
  return (
    <div class={`${estilos.fim} ${estilos.semTela}`}>
      <p role="status" class={estilos.fimSub}>
        {texto}
      </p>
      {voltar && (
        <Botao3D variante="neutro" href={voltar.href}>
          {voltar.rotulo}
        </Botao3D>
      )}
    </div>
  );
}

/** Rotas /revisar/sessao, /revisar/treino/:curso e /caderno/praticar/:conceito. */
export function RotaSessao({ modo }: { modo: ModoSessao }) {
  const { params } = useRoute();
  const chave = params.curso ?? params.conceito ?? '';
  return carregado.value ? (
    <Sessao key={`${modo}/${chave}`} modo={modo} chave={chave} />
  ) : (
    <Mensagem texto="Carregando…" />
  );
}

function Sessao({ modo, chave }: { modo: ModoSessao; chave: string }) {
  const { route } = useLocation();
  const ids = useMemo(() => conceitosDaRota(modo, chave), [modo, chave]);
  const [itens, setItens] = useState<ItemSessao[] | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [fim, setFim] = useState<DadosFim | null>(null);
  const [saindo, setSaindo] = useState(false);
  const inicio = useRef(performance.now());
  const topo = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);
  const concluiu = useRef(false);

  useEffect(() => {
    let ativo = true;
    void montarItens(modo, ids)
      .then((l) => ativo && setItens(l))
      .catch(() => ativo && setItens([]));
    return () => {
      ativo = false;
    };
  }, [modo, ids]);

  const destinoDeSair =
    modo === 'conceito' ? '/caderno' : modo === 'treino' ? '/revisar' : '/revisar';
  const sair = () => route(destinoDeSair);
  useEscSair(() => (fim ? sair() : setSaindo(true)), saindo);

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    window.scrollTo(0, 0);
    topo.current?.focus();
  }, [respostas.length, verificado, fim === null]);

  const rotulos = NOMES[modo];
  const comum = {
    posicao: rotulos.posicao,
    nome: rotulos.nome,
    rascunho: false,
    aoFechar: () => (fim ? sair() : setSaindo(true)),
  };

  if (itens === null) {
    return (
      <LayoutLicao {...comum} rodape={<span />}>
        <Mensagem texto="Montando as perguntas…" />
      </LayoutLicao>
    );
  }
  if (itens.length === 0) {
    return (
      <LayoutLicao {...comum} rodape={<span />}>
        <Mensagem
          texto={
            modo === 'revisao'
              ? 'Não há nada para revisar agora.'
              : 'Não encontramos perguntas para este conceito ou curso.'
          }
          voltar={{
            href: destinoDeSair,
            rotulo: modo === 'conceito' ? 'Voltar ao caderno' : 'Voltar para Revisar',
          }}
        />
      </LayoutLicao>
    );
  }

  const indice = respostas.length - (verificado ? 1 : 0);
  const item = itens[indice];
  const ultima = respostas[indice];

  function verificar() {
    if (!item || escolha === null) return;
    const s = Math.min(120, Math.round((performance.now() - inicio.current) / 1000));
    setRespostas([...respostas, { ok: escolha === item.apresentacao.correta, escolha, s }]);
    setVerificado(true);
  }

  function concluir(lista: Resposta[]) {
    if (concluiu.current) return;
    concluiu.current = true;
    const resultados = itens!.map((it, i) => ({
      conceitoId: it.conceitoId,
      acertou: lista[i]?.ok ?? false,
    }));
    const acertos = resultados.filter((r) => r.acertou).length;
    const xpBruto = modo === 'revisao' ? acertos * xpDoAcerto(true) : 0;
    const c =
      modo === 'conceito'
        ? { xpGanho: 0, mudancas: [] }
        : registrarConclusaoRevisao(resultados, xpBruto, modo);
    const cursos = new Set(
      ids.flatMap((id) => {
        const p = partirIdLicao(caderno.peek()[id]?.licaoId ?? '');
        return p ? [p.cursoId] : [];
      }),
    );
    setFim({
      modo,
      xpGanho: c.xpGanho,
      acertos,
      total: itens!.length,
      tempo: formatarTempo(lista.reduce((t, r) => t + r.s, 0)),
      cursosVindos: cursos.size,
      linhas: c.mudancas.map((m) => ({
        conceitoId: m.conceitoId,
        nome: catalogo.conceitos[m.conceitoId]?.nome ?? m.conceitoId,
        acertou: resultados.find((r) => r.conceitoId === m.conceitoId)?.acertou ?? false,
        de: m.de,
        para: m.para,
        voltaEmDias: m.voltaEmDias,
      })),
    });
  }

  function continuar() {
    setVerificado(false);
    setEscolha(null);
    inicio.current = performance.now();
    if (respostas.length >= itens!.length) concluir(respostas);
  }

  const modais = (
    <SairDaLicao
      aberta={saindo}
      aoContinuar={() => setSaindo(false)}
      aoSair={sair}
      titulo={SAIR[modo].titulo}
      texto={SAIR[modo].texto}
      rotuloContinuar={SAIR[modo].continuar}
    />
  );

  if (fim) {
    return (
      <LayoutLicao
        {...comum}
        semTopo
        rodape={
          <>
            <Botao3D variante="neutro" onClick={() => route('/caderno')}>
              Ver o caderno
            </Botao3D>
            <Botao3D onClick={() => route('/')}>Continuar</Botao3D>
          </>
        }
      >
        <div ref={topo} tabIndex={-1} style={{ outline: 'none' }}>
          <Concluida d={fim} />
        </div>
        {modais}
      </LayoutLicao>
    );
  }

  return (
    <LayoutLicao
      {...comum}
      feedback={
        verificado && item && ultima
          ? {
              tom: ultima.ok ? 'certa' : 'errada',
              conteudo: (
                <FeedbackPratica
                  ok={ultima.ok}
                  xp={modo === 'revisao' && ultima.ok ? xpDoAcerto(true) : null}
                  textoCerto={item.apresentacao.opcoes[item.apresentacao.correta] ?? ''}
                  ex={item.ex}
                  avisoRevisao={modo === 'revisao'}
                />
              ),
            }
          : undefined
      }
      rodape={
        <>
          <span />
          {verificado ? (
            <Botao3D variante={ultima?.ok ? 'primario' : 'perigo'} onClick={continuar}>
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
        {item && (
          <PerguntaPratica
            key={indice}
            numero={indice + 1}
            total={itens.length}
            feitos={respostas.length}
            apresentacao={item.apresentacao}
            escolha={escolha}
            aoEscolher={setEscolha}
            verificado={verificado}
            podeRever={false}
            aoRever={() => undefined}
          />
        )}
      </div>
      {modais}
    </LayoutLicao>
  );
}
