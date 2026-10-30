import { useState } from 'preact/hooks';
import { bibliografia, carregarLicao, catalogo } from '../conteudo/index.ts';
import { Selo } from '../componentes/Selo.tsx';
import estilos from './Dev.module.css';

/** Ferramentas de desenvolvimento (só dev e prévias). M1: catálogo. M2 acrescenta o estado. */
export function Dev() {
  const { cursos, conceitos, erros } = catalogo;
  const nLicoes = cursos.reduce(
    (n, c) => n + c.unidades.reduce((m, u) => m + u.licoes.length, 0),
    0,
  );
  const [carregada, setCarregada] = useState('');
  async function abrirArquivo(curso: string, unidade: string, licao: string) {
    const l = await carregarLicao(curso, unidade, licao);
    setCarregada(
      l ? `Lição carregada: ${l.titulo} (${l.pratica.length} exercícios)` : 'Lição não encontrada.',
    );
  }
  const nome = (id: string) => conceitos[id]?.nome ?? id;

  return (
    <div class={estilos.pagina}>
      <h1>Ferramentas de desenvolvimento</h1>

      <section aria-labelledby="d-catalogo">
        <h2 id="d-catalogo">Catálogo</h2>
        <p class={estilos.resumo}>
          {cursos.length} cursos · {nLicoes} lições · {Object.keys(conceitos).length} conceitos ·{' '}
          {bibliografia.length} fontes ·{' '}
          {catalogo.comRascunhos ? 'com rascunhos' : 'só lições revisadas'}
        </p>

        {erros.length > 0 && (
          <p class={estilos.erro} role="alert">
            {erros.length} erro(s) de conteúdo. Veja a camada sobre a página ou o terminal.
          </p>
        )}

        {carregada && (
          <p class={estilos.resumo} role="status">
            {carregada}
          </p>
        )}

        <ul class={estilos.arvore} data-testid="catalogo">
          {cursos.map((c) => (
            <li key={c.id}>
              <div class={estilos.linha}>
                <Selo nivel={c.nivel} />
                <strong>{c.titulo}</strong>
                <code>{c.id}</code>
                {c.requerConceitos.length > 0 && (
                  <span class={estilos.mudo}>exige {c.requerConceitos.map(nome).join(', ')}</span>
                )}
                {c.libera.length > 0 && (
                  <span class={estilos.mudo}>libera {c.libera.join(', ')}</span>
                )}
              </div>
              <ul>
                {c.unidades.map((u) => (
                  <li key={u.id}>
                    <div class={estilos.linha}>
                      <strong>
                        {u.ordem}. {u.titulo}
                      </strong>
                      <code>{u.id}</code>
                    </div>
                    <ul>
                      {u.licoes.map((l) => (
                        <li key={l.id}>
                          <div class={estilos.linha}>
                            <a href={`/c/${c.id}/${u.id}/${l.id}`}>{l.titulo}</a>
                            <span
                              class={l.status === 'revisado' ? estilos.revisado : estilos.rascunho}
                            >
                              {l.status === 'revisado' ? 'Revisado' : 'Rascunho'}
                            </span>
                            <button
                              type="button"
                              class={estilos.etiqueta}
                              onClick={() => abrirArquivo(c.id, u.id, l.id)}
                            >
                              Carregar arquivo
                            </button>
                            {l.tipo === 'desafio' && <span class={estilos.etiqueta}>desafio</span>}
                            <span class={estilos.mudo}>
                              {l.nCards} cards · {l.nExercicios} exercícios
                            </span>
                            {l.ensina.length > 0 && (
                              <span class={estilos.mudo}>
                                ensina {l.ensina.map(nome).join(', ')}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {cursos.length === 0 && <p>Nenhuma lição publicada.</p>}
      </section>
    </div>
  );
}

export default Dev;
