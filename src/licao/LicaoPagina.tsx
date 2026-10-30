import { useLocation, useRoute } from 'preact-iso';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Janela } from '../componentes/Janela';
import type { Licao } from '../content-schema/licao.ts';
import { catalogo, carregarLicao } from '../conteudo/index.ts';
import { Licao as LayoutLicao } from '../layouts/Licao';
import { Site as LayoutSite } from '../layouts/Site';
import { Erro404 } from '../paginas/Erro404';
import { gravarAndamento, lerAndamento } from './andamento.ts';
import { CardExplicacao, Checagem, FimDaExplicacao, PraticaProvisoria, Situacao } from './Etapas';
import {
  andamentoDoPasso,
  fasesDoPasso,
  indiceAnterior,
  indiceDoAndamento,
  passosDaLicao,
  rotuloDoBotao,
} from './fluxo.ts';
import estilos from './licao.module.css';

function localizar(curso: string, unidade: string, licao: string) {
  const c = catalogo.cursos.find((x) => x.id === curso);
  const u = c?.unidades.find((x) => x.id === unidade);
  const iLicao = u?.licoes.findIndex((x) => x.id === licao) ?? -1;
  if (!c || !u || iLicao === -1) return null;
  return { unidade: u, numeroUnidade: c.unidades.indexOf(u) + 1, numeroLicao: iLicao + 1 };
}

/** Rota /c/:curso/:unidade/:licao. */
export function RotaLicao() {
  const { params } = useRoute();
  const { curso = '', unidade = '', licao = '' } = params;
  const id = `${curso}/${unidade}/${licao}`;
  const [dados, setDados] = useState<Licao | null | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    setDados(undefined);
    void carregarLicao(curso, unidade, licao)
      .then((l) => ativo && setDados(l))
      .catch(() => ativo && setDados(null));
    return () => {
      ativo = false;
    };
  }, [id]);

  const lugar = localizar(curso, unidade, licao);
  if (dados === null || !lugar) {
    return (
      <LayoutSite>
        <Erro404 />
      </LayoutSite>
    );
  }
  if (dados === undefined) {
    return (
      <LayoutSite>
        <p role="status" style={{ padding: 'var(--espaco-6)' }}>
          Carregando a lição…
        </p>
      </LayoutSite>
    );
  }
  return (
    <LicaoCarregada
      key={id}
      id={id}
      licao={dados}
      posicao={
        dados.tipo === 'desafio'
          ? `Unidade ${lugar.numeroUnidade} · Desafio`
          : `Unidade ${lugar.numeroUnidade} · Lição ${lugar.numeroLicao}`
      }
    />
  );
}

function LicaoCarregada({ id, licao, posicao }: { id: string; licao: Licao; posicao: string }) {
  const { route } = useLocation();
  const passos = useMemo(() => passosDaLicao(licao), [licao]);
  const salvo = useMemo(() => lerAndamento(id), [id]);
  const [indice, setIndice] = useState(() => indiceDoAndamento(passos, salvo));
  const [palpite, setPalpite] = useState<number | null>(() => salvo?.palpite ?? null);
  // A resposta da checagem nunca é guardada: ao voltar, a pergunta recomeça.
  const [escolha, setEscolha] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const saindoRef = useRef(false);
  saindoRef.current = saindo;
  const topo = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  const passo = passos[indice] ?? { tipo: 'pratica' as const };
  const cards = licao.explicacao ?? [];

  // Grava na hora, dentro do clique: um useEffect pode chegar tarde e perder o ponto ao recarregar.
  function guardar(novoIndice: number, novoPalpite: number | null) {
    const alvo = passos[novoIndice] ?? { tipo: 'pratica' as const };
    gravarAndamento(andamentoDoPasso(id, alvo, novoPalpite));
  }

  function escolherPalpite(i: number) {
    setPalpite(i);
    guardar(indice, i);
  }

  // Ao trocar de etapa, o foco vai para o conteúdo novo e a página volta ao topo.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    window.scrollTo(0, 0);
    topo.current?.focus();
  }, [indice]);

  // Esc abre a confirmação de sair (a Janela cuida do Esc enquanto está aberta).
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saindoRef.current) setSaindo(true);
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  function irPara(novo: number) {
    guardar(novo, palpite);
    setIndice(novo);
    setEscolha(null);
    setVerificado(false);
  }

  const anterior = indiceAnterior(passos, indice);
  const ultimo = indice >= passos.length - 1;
  const podeAvancar =
    passo.tipo === 'situacao'
      ? palpite !== null
      : passo.tipo === 'checagem'
        ? verificado || escolha !== null
        : passo.tipo !== 'pratica';

  function avancar() {
    if (passo.tipo === 'checagem' && !verificado) {
      setVerificado(true);
      return;
    }
    if (!ultimo) irPara(indice + 1);
  }

  const ultimoCard = cards.length - 1;
  let conteudo;
  if (passo.tipo === 'situacao' && licao.situacao) {
    conteudo = (
      <Situacao
        texto={licao.situacao.texto}
        palpites={licao.situacao.palpites}
        palpite={palpite}
        aoEscolher={escolherPalpite}
      />
    );
  } else if (passo.tipo === 'card' && cards[passo.i]) {
    conteudo = (
      <CardExplicacao
        card={cards[passo.i] as NonNullable<(typeof cards)[number]>}
        indice={passo.i}
        total={cards.length}
        licaoId={id}
        rascunho={licao.status === 'rascunho'}
      />
    );
  } else if (passo.tipo === 'checagem' && cards[passo.i]?.checagem) {
    const checagem = cards[passo.i]?.checagem as NonNullable<(typeof cards)[number]['checagem']>;
    const ehFinal = passo.i === ultimoCard;
    conteudo = (
      <Checagem
        checagem={checagem}
        escolha={escolha}
        aoEscolher={setEscolha}
        verificado={verificado}
        palpite={ehFinal && palpite !== null ? (licao.situacao?.palpites[palpite] ?? null) : null}
      />
    );
  } else if (passo.tipo === 'fim') {
    conteudo = (
      <FimDaExplicacao conceitos={licao.ensina.map((c) => catalogo.conceitos[c]?.nome ?? c)} />
    );
  } else {
    conteudo = <PraticaProvisoria />;
  }

  return (
    <LayoutLicao
      posicao={posicao}
      nome={licao.titulo}
      rascunho={licao.status === 'rascunho'}
      fases={fasesDoPasso(passos, indice)}
      aoFechar={() => setSaindo(true)}
      rodape={
        <>
          {anterior !== null ? (
            <Botao3D variante="neutro" onClick={() => irPara(anterior)}>
              Voltar
            </Botao3D>
          ) : (
            <span />
          )}
          {passo.tipo !== 'pratica' && (
            <Botao3D desativado={!podeAvancar} onClick={avancar}>
              {rotuloDoBotao(passo, verificado)}
            </Botao3D>
          )}
        </>
      }
    >
      <div ref={topo} tabIndex={-1} style={{ outline: 'none' }}>
        {conteudo}
      </div>
      <Janela titulo="Sair da lição?" aberta={saindo} aoFechar={() => setSaindo(false)}>
        <div class={estilos.sair}>
          <Capi tamanho={96} />
          <h2>Sair da lição?</h2>
          <p>Seu avanço fica salvo. Quando você voltar, continua exatamente de onde parou.</p>
          <div class={estilos.sairAcoes}>
            <Botao3D larga onClick={() => setSaindo(false)}>
              Continuar a lição
            </Botao3D>
            <Botao3D larga variante="neutro" onClick={() => route('/')}>
              Sair
            </Botao3D>
          </div>
        </div>
      </Janela>
    </LayoutLicao>
  );
}
