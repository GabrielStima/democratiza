import { lazy, LocationProvider, Route, Router } from 'preact-iso';
import type { ComponentChildren } from 'preact';
import { Avisos } from './componentes/Aviso';
import { App as LayoutApp } from './layouts/App';
import { Licao as LayoutLicao } from './layouts/Licao';
import { Site as LayoutSite } from './layouts/Site';
import { EmConstrucao } from './paginas/EmConstrucao';
import { Erro404 } from './paginas/Erro404';

/** Telas de desenvolvimento: existem só no `npm run dev` e nas prévias. */
export const MOSTRAR_DEV: boolean =
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1';

/* O guia de estilo e o /_dev só entram no pacote quando a variável está ligada. */
const Estilo = lazy(() =>
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1'
    ? import('./dev/Estilo')
    : Promise.resolve({ default: Erro404 }),
);

function noSite(filho: ComponentChildren) {
  return <LayoutSite>{filho}</LayoutSite>;
}
function noApp(filho: ComponentChildren) {
  return <LayoutApp>{filho}</LayoutApp>;
}

export function Aplicacao() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={() => noSite(<EmConstrucao titulo="Início" milestone="M5" />)} />
        <Route
          path="/cursos"
          component={() => noApp(<EmConstrucao titulo="Cursos" milestone="M8" />)}
        />
        <Route
          path="/c/:curso"
          component={() => noApp(<EmConstrucao titulo="Curso" milestone="M5" />)}
        />
        <Route
          path="/c/:curso/:unidade/:licao"
          component={() => (
            <LayoutLicao>
              <EmConstrucao titulo="Lição" milestone="M3" />
            </LayoutLicao>
          )}
        />
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
          component={() =>
            MOSTRAR_DEV
              ? noApp(<EmConstrucao titulo="Ferramentas de desenvolvimento" milestone="M1" />)
              : noSite(<Erro404 />)
          }
        />
        <Route default component={() => noSite(<Erro404 />)} />
      </Router>
      <Avisos />
    </LocationProvider>
  );
}
