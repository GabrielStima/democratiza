import { useState } from 'preact/hooks';
import { ofensivaAtual, ofensivaEmRisco } from '../engine/ofensiva.ts';
import { deslocamentoAtual, hoje } from '../engine/relogio.ts';
import { conceitosVencidos } from '../engine/revisao.ts';
import { xpDeHoje } from '../engine/xp.ts';
import { caderno, definirCaderno, definirEstado, estado } from '../stores/index.ts';
import { PERFIS, type Perfil } from './perfis.ts';
import { moverRelogio, zerarRelogio } from './relogioDev.ts';
import { bibliografia, carregarLicao, catalogo } from '../conteudo/index.ts';
import { Botao3D } from '../componentes/Botao3D.tsx';
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

      <SecaoEstado />
    </div>
  );
}

function SecaoEstado() {
  const [, atualizar] = useState(0);
  const e = estado.value;
  const dia = hoje();
  const deslocamento = deslocamentoAtual();
  const vencidos = conceitosVencidos(caderno.value, dia).length;

  function carregar(p: Perfil) {
    const r = p.construir(catalogo, dia);
    definirEstado(r.estado);
    definirCaderno(r.caderno);
  }
  function mover(dias: number) {
    moverRelogio(dias);
    atualizar((n) => n + 1);
  }
  function limparTudo() {
    definirEstado(null);
    definirCaderno({});
  }

  return (
    <section aria-labelledby="d-estado">
      <h2 id="d-estado">Estado</h2>
      <p class={estilos.resumo}>
        Perfis de demonstração. Carregar um perfil substitui o progresso deste navegador.
      </p>

      <ul class={estilos.perfis}>
        {PERFIS.map((p) => (
          <li key={p.id}>
            <Botao3D
              variante="neutro"
              onClick={() => carregar(p)}
              aria-label={`Carregar perfil: ${p.nome}`}
            >
              {p.nome}
            </Botao3D>
            <span class={estilos.mudo}>{p.descricao}</span>
          </li>
        ))}
      </ul>

      <div class={estilos.linha}>
        <Botao3D variante="perigo" onClick={limparTudo}>
          Limpar tudo
        </Botao3D>
        <Botao3D variante="secundario" onClick={() => mover(-1)}>
          Voltar 1 dia
        </Botao3D>
        <Botao3D variante="secundario" onClick={() => mover(1)}>
          Avançar 1 dia
        </Botao3D>
        <Botao3D
          variante="neutro"
          onClick={() => {
            zerarRelogio();
            atualizar((n) => n + 1);
          }}
        >
          Relógio real
        </Botao3D>
      </div>

      <dl class={estilos.fatos} data-testid="fatos">
        <dt>Dia simulado</dt>
        <dd>
          {dia} ({deslocamento >= 0 ? '+' : ''}
          {deslocamento})
        </dd>
        <dt>Visitante?</dt>
        <dd>{e ? 'não' : 'sim'}</dd>
        <dt>Ofensiva exibida</dt>
        <dd>
          {e ? ofensivaAtual(e.ofensiva, dia) : 0}
          {e && ofensivaEmRisco(e.ofensiva, dia) ? ' (em risco)' : ''}
        </dd>
        <dt>XP hoje</dt>
        <dd>{e ? `${xpDeHoje(e, dia)} / ${e.config.metaDiaria}` : '–'}</dd>
        <dt>Conceitos no caderno</dt>
        <dd>{Object.keys(caderno.value).length}</dd>
        <dt>Conceitos vencidos</dt>
        <dd>{vencidos}</dd>
      </dl>

      <details>
        <summary>Estado em JSON</summary>
        <pre class={estilos.json}>{JSON.stringify(e, null, 2) ?? 'null (visitante)'}</pre>
      </details>
    </section>
  );
}

export default Dev;
