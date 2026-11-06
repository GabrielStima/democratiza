import legal from 'virtual:democratiza/legal';
import { Capi } from '../componentes/Capi';
import { useRolarParaHash } from '../layouts/useHash.ts';
import { dataPorExtenso } from './data.ts';
import estilos from './legal.module.css';

/** Política de privacidade e Termos de uso: texto de `content/legal/*.md`, no layout de texto do Sobre. */
export function PaginaLegal({ documento }: { documento: 'privacidade' | 'termos' }) {
  useRolarParaHash();
  const doc = legal[documento];
  return (
    <article class={estilos.pagina} aria-labelledby="titulo-legal">
      <header class={estilos.cabeca}>
        <Capi tamanho={110} />
        <div>
          <h1 id="titulo-legal">{doc.titulo}</h1>
          <p>{doc.resumo}</p>
          <p class={estilos.data}>
            Última atualização:{' '}
            <time dateTime={doc.atualizadoEm}>{dataPorExtenso(doc.atualizadoEm)}</time>
          </p>
        </div>
      </header>
      <div class={estilos.texto} dangerouslySetInnerHTML={{ __html: doc.html }} />
      <nav class={estilos.outras} aria-label="Outras páginas legais">
        <a href={documento === 'termos' ? '/privacidade' : '/termos'}>
          {documento === 'termos' ? 'Política de privacidade' : 'Termos de uso'}
        </a>
        <a href="/sobre">Sobre o Democratiza</a>
      </nav>
    </article>
  );
}
