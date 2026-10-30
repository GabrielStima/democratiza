import { useRoute } from 'preact-iso';
import { Botao3D } from '../componentes/Botao3D';
import { BarraProgresso } from '../componentes/BarraProgresso';
import { Cartao } from '../componentes/Cartao';
import { Selo } from '../componentes/Selo';
import { catalogo } from '../conteudo/index.ts';
import { dadosDoCurso, type LicaoDoCurso, type UnidadeDoCurso } from '../engine/telas.ts';
import { App as LayoutApp } from '../layouts/App';
import { Site as LayoutSite } from '../layouts/Site';
import { Erro404 } from '../paginas/Erro404';
import { caderno, estado } from '../stores/index.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './curso.module.css';

const ROTULO_ESTADO = { feita: 'Feita', atual: 'Agora', bloqueada: 'Bloqueada' } as const;

function Licao({ l }: { l: LicaoDoCurso }) {
  const corpo = (
    <>
      <span class={`${estilos.marca} ${estilos[`marca_${l.estado}`]}`} aria-hidden="true">
        {l.estado === 'feita' ? '✓' : l.desafio ? '★' : l.numero}
      </span>
      <span class={estilos.licaoTexto}>
        <strong>{l.titulo}</strong>
        <span class={estilos.etiquetas}>
          {l.desafio ? (
            <span>Revisão da unidade</span>
          ) : (
            l.conceitos.map((c) => <span key={c}>{c}</span>)
          )}
        </span>
      </span>
      <span class={estilos.estadoLicao}>{ROTULO_ESTADO[l.estado]}</span>
    </>
  );
  if (l.estado === 'bloqueada') {
    return (
      <li>
        <button
          type="button"
          class={`${estilos.licao} ${estilos.licao_bloqueada}`}
          aria-disabled="true"
        >
          {corpo}
          <span class={estilos.dica}>Termine a lição anterior para abrir esta.</span>
        </button>
      </li>
    );
  }
  return (
    <li>
      <a href={l.destino} class={`${estilos.licao} ${estilos[`licao_${l.estado}`]}`}>
        {corpo}
      </a>
    </li>
  );
}

function Unidade({ u }: { u: UnidadeDoCurso }) {
  const feitas = u.licoes.filter((l) => l.estado === 'feita').length;
  return (
    <details
      class={`${estilos.unidade} ${estilos[`unidade_${u.status}`]}`}
      open={u.status === 'atual'}
    >
      <summary>
        <span class={estilos.unidadeTitulo}>
          Unidade {u.numero} · {u.titulo}
        </span>
        <span class={estilos.mudo}>
          {u.nLicoes} {u.nLicoes === 1 ? 'lição' : 'lições'} ·{' '}
          {u.status === 'feita'
            ? 'feita'
            : u.status === 'atual'
              ? `${feitas} de ${u.nLicoes}`
              : (u.aviso ?? 'bloqueada')}
        </span>
      </summary>
      {u.descricao && <p class={estilos.mudo}>{u.descricao}</p>}
      <ul class={estilos.licoes}>
        {u.licoes.map((l) => (
          <Licao key={l.id} l={l} />
        ))}
      </ul>
    </details>
  );
}

function Pagina({ id }: { id: string }) {
  const curso = catalogo.cursos.find((c) => c.id === id);
  if (!curso) return <Erro404 />;
  const d = dadosDoCurso(curso, estado.value, caderno.value, catalogo);
  const visitante = estado.value === null;
  return (
    <div class={estilos.pagina}>
      <div class={estilos.principal}>
        <nav aria-label="Caminho" class={estilos.caminho}>
          Cursos / <span aria-current="page">{curso.titulo}</span>
        </nav>
        <header class={estilos.cabecalho}>
          <Selo nivel={curso.nivel} />
          <h1>{curso.titulo}</h1>
          <p>{curso.descricao}</p>
          <p class={estilos.mudo}>
            {d.progresso.feitas} de {d.progresso.total} lições
          </p>
          <BarraProgresso valor={d.progresso.percentual} rotulo={`Progresso em ${curso.titulo}`} />
          {d.continuar &&
            (visitante ? (
              <Botao3D onClick={() => abrirMeta('primeira')}>{d.continuar.rotulo}</Botao3D>
            ) : (
              <Botao3D href={d.continuar.destino}>{d.continuar.rotulo}</Botao3D>
            ))}
          {!d.liberado && (
            <div class={estilos.bloqueio} role="note">
              <p>
                <strong>Este curso ainda está bloqueado. Faltam estes conceitos:</strong>
              </p>
              <ul>
                {d.faltantes.map((f) => (
                  <li key={f.id}>
                    {f.nome}
                    {f.cursoTitulo && (
                      <span class={estilos.mudo}> · aprenda em {f.cursoTitulo}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>
        <section aria-labelledby="h-unidades">
          <h2 id="h-unidades" class={estilos.secaoH}>
            Unidades
          </h2>
          {d.unidades.map((u) => (
            <Unidade key={u.id} u={u} />
          ))}
        </section>
      </div>
      <aside class={estilos.lateral}>
        <Cartao>
          <h2 class={estilos.cartaoH}>Conceitos do curso</h2>
          <p class={estilos.grande}>
            {d.conceitos.aprendidos} de {d.conceitos.total}
          </p>
          {d.conceitos.nomes.length > 0 && (
            <ul class={estilos.etiquetasLista}>
              {d.conceitos.nomes.map((n) => (
                <li key={n}>{n}</li>
              ))}
              {d.conceitos.mais > 0 && <li>+{d.conceitos.mais}</li>}
            </ul>
          )}
          <a href="/caderno">Ver no caderno</a>
        </Cartao>
        {d.libera.length > 0 && (
          <Cartao>
            <h2 class={estilos.cartaoH}>O que este curso libera</h2>
            <ul class={estilos.libera}>
              {d.libera.map((c) => (
                <li key={c.id}>
                  <a href={`/c/${c.id}`}>{c.titulo}</a>
                </li>
              ))}
            </ul>
          </Cartao>
        )}
      </aside>
    </div>
  );
}

/** Rota /c/:curso. Quem não tem progresso vê a página no layout do site. */
export function RotaCurso() {
  const { params } = useRoute();
  const conteudo = <Pagina id={params.curso ?? ''} />;
  return estado.value ? <LayoutApp>{conteudo}</LayoutApp> : <LayoutSite>{conteudo}</LayoutSite>;
}
