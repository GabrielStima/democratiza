import { lazy, LocationProvider, Route, Router } from 'preact-iso';
import type { ComponentChildren } from 'preact';
import { Avisos } from './componentes/Aviso';
import { estado } from './stores/index.ts';
import { RotaCurso } from './curso/PaginaCurso.tsx';
import { HomeProgresso } from './home/HomeProgresso.tsx';
import { HomeVisitante } from './home/HomeVisitante.tsx';
import { JanelaMeta } from './home/JanelaMeta.tsx';
import { RotaLicao } from './licao/LicaoPagina.tsx';
import { ErrosConteudo } from './conteudo/ErrosConteudo.tsx';
import { App as LayoutApp } from './layouts/App';
import { Site as LayoutSite } from './layouts/Site';
import { EmConstrucao } from './paginas/EmConstrucao';
import { Erro404 } from './paginas/Erro404';

/** Telas de desenvolvimento: existem só no `npm run dev` e nas prévias. */
export const MOSTRAR_DEV: boolean =
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1';

/* O guia de estilo e o /_dev só entram no pacote quando a variável está ligada. */
const Dev = lazy(() =>
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1'
    ? import('./dev/Dev.tsx')
    : Promise.resolve({ default: Erro404 }),
);
const Estilo = lazy(() =>
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1'
    ? import('./dev/Estilo')
    : Promise.resolve({ default: Erro404 }),
);

function noSite(filho: ComponentChildren, faixas = false) {
  return <LayoutSite faixas={faixas}>{filho}</LayoutSite>;
}
function noApp(filho: ComponentChildren) {
  return <LayoutApp>{filho}</LayoutApp>;
}

/** A rota `/` decide a Home olhando se existe progresso salvo neste navegador. */
function Inicio() {
  const e = estado.value;
  return e ? noApp(<HomeProgresso estado={e} />) : noSite(<HomeVisitante />, true);
}

export function Aplicacao() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={Inicio} />
        <Route
          path="/cursos"
          component={() => noApp(<EmConstrucao titulo="Cursos" milestone="M8" />)}
        />
        <Route path="/c/:curso" component={RotaCurso} />
        <Route path="/c/:curso/:unidade/:licao" component={RotaLicao} />
        <Route
          path="/caderno"
          component={() => noApp(<EmConstrucao titulo="Caderno" milestone="M6" />)}
        />
        <Route
          path="/revisar"
          component={() => noApp(<EmConstrucao titulo="Revisar" milestone="M6" />)}
        />
        <Route
          path="/sobre"
          component={() => noApp(<EmConstrucao titulo="Sobre" milestone="M7" />)}
        />
        <Route
          path="/_estilo"
          component={() => (MOSTRAR_DEV ? noApp(<Estilo />) : noSite(<Erro404 />))}
        />
        <Route
          path="/_dev"
          component={() => (MOSTRAR_DEV ? noApp(<Dev />) : noSite(<Erro404 />))}
        />
        <Route default component={() => noSite(<Erro404 />)} />
      </Router>
      <JanelaMeta />
      <Avisos />
      {MOSTRAR_DEV && <ErrosConteudo />}
    </LocationProvider>
  );
}
