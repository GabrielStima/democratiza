import { useMemo, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Forca } from '../componentes/Forca';
import { catalogo, carregarLicao } from '../conteudo/index.ts';
import type { Card } from '../content-schema/licao.ts';
import { primeiraLicaoDoSite } from '../engine/telas.ts';
import {
  cursosDoCaderno,
  filtrarCaderno,
  itensDoCaderno,
  type ConceitoDoCaderno,
} from '../engine/telasRevisao.ts';
import { ReverExplicacao } from '../licao/Janelas';
import { partirIdLicao } from '../engine/progresso.ts';
import { caderno } from '../stores/index.ts';
import estilos from './caderno.module.css';

function CursoDoConceito({ c }: { c: ConceitoDoCaderno }) {
  return <span class={`${estilos.curso} ${estilos[c.nivel]}`}>{c.cursoTitulo}</span>;
}

function CartaoDoConceito({ c }: { c: ConceitoDoCaderno }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [aberta, setAberta] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function rever() {
    setFalhou(false);
    const p = partirIdLicao(c.licaoId);
    try {
      const licao = p ? await carregarLicao(p.cursoId, p.unidadeId, p.licaoId) : null;
      const lista = licao?.explicacao ?? [];
      if (lista.length === 0) {
        setFalhou(true);
        return;
      }
      setCards(lista);
      setAberta(true);
    } catch {
      setFalhou(true);
    }
  }

  return (
    <article class={estilos.cartao} aria-label="Cartão do conceito">
      <div class={estilos.cartaoTopo}>
        <CursoDoConceito c={c} />
        <span class={estilos.forcaTexto}>Força {c.caixa} de 5</span>
      </div>
      <h2>{c.nome}</h2>
      <div class={estilos.bloco}>
        <h3>Em uma frase</h3>
        <p>{c.definicao}</p>
      </div>
      <div class={estilos.bloco}>
        <h3>No dia a dia</h3>
        <p>{c.exemplo}</p>
      </div>
      <div class={`${estilos.bloco} ${estilos.confunda}`}>
        <h3>Não confunda com</h3>
        <p>{c.naoConfunda}</p>
      </div>
      <p class={estilos.aprendido}>
        Aprendido em: <a href={c.licaoDestino}>{c.licaoTitulo}</a>
      </p>
      <p class={estilos.fonte}>
        Fonte:{' '}
        {c.fonte.link ? (
          <a href={c.fonte.link} target="_blank" rel="noopener noreferrer">
            {c.fonte.descricao}
          </a>
        ) : (
          c.fonte.descricao
        )}
      </p>
      <div class={estilos.acoes}>
        <Botao3D variante="neutro" tamanho="pequeno" onClick={() => void rever()}>
          Rever explicação
        </Botao3D>
        <Botao3D variante="neutro" tamanho="pequeno" href={`/caderno/praticar/${c.id}`}>
          Praticar agora
        </Botao3D>
      </div>
      {falhou && (
        <p role="status" class={estilos.aviso}>
          Esta lição não tem uma explicação para rever.
        </p>
      )}
      {cards && <ReverExplicacao cards={cards} aberta={aberta} aoFechar={() => setAberta(false)} />}
    </article>
  );
}

function CadernoVazio() {
  const exemplo = Object.values(catalogo.conceitos)[0];
  const primeira = primeiraLicaoDoSite(catalogo);
  return (
    <div class={estilos.pagina}>
      <header class={estilos.cabeca}>
        <h1>Seu caderno</h1>
        <p>0 conceitos aprendidos.</p>
      </header>
      <section class={estilos.vazio}>
        <Capi tamanho={150} />
        <h2>Seu caderno ainda está vazio</h2>
        <p>
          Termine sua primeira lição e cada conceito novo aparece aqui, com a definição, um exemplo
          e a fonte.
        </p>
        {primeira && <Botao3D href={primeira}>Fazer a primeira lição</Botao3D>}
      </section>
      {exemplo && (
        <section class={estilos.exemplo} aria-labelledby="como-aparece">
          <h2 id="como-aparece">Como um cartão vai aparecer</h2>
          <div class={estilos.cartaoExemplo}>
            <p class={estilos.rotulosExemplo}>
              <span class={`${estilos.curso} ${estilos.introducao}`}>
                {catalogo.cursos[0]?.titulo ?? ''}
              </span>
              <span class={estilos.forcaTexto}>Exemplo</span>
            </p>
            <strong>{exemplo.nome}</strong>
            <p>{exemplo.definicao}</p>
          </div>
        </section>
      )}
    </div>
  );
}

/** Tela Caderno: busca, filtro por curso, lista de conceitos e o cartão do selecionado. */
export function Caderno() {
  const todos = useMemo(() => itensDoCaderno(caderno.value, catalogo), [caderno.value]);
  const cursos = useMemo(() => cursosDoCaderno(todos, catalogo), [todos]);
  const [busca, setBusca] = useState('');
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);

  if (todos.length === 0) return <CadernoVazio />;

  const lista = filtrarCaderno(todos, busca, cursoId);
  const selecionado = lista.find((c) => c.id === escolhido) ?? lista[0];

  return (
    <div class={estilos.pagina}>
      <div class={estilos.cabecaComBusca}>
        <header class={estilos.cabeca}>
          <h1>Seu caderno</h1>
          <p>
            {todos.length} {todos.length === 1 ? 'conceito aprendido' : 'conceitos aprendidos'}.
            Clique em um para ver o cartão completo.
          </p>
        </header>
        <div role="search" class={estilos.busca}>
          <label for="busca-conceito">Buscar conceito</label>
          <input
            id="busca-conceito"
            type="search"
            placeholder="Ex.: mandato"
            value={busca}
            onInput={(e) => setBusca(e.currentTarget.value)}
          />
        </div>
      </div>

      {cursos.length > 1 && (
        <div role="group" aria-label="Filtrar por curso" class={estilos.filtros}>
          {[{ id: null, titulo: 'Todos' }, ...cursos].map((c) => (
            <button
              key={c.id ?? 'todos'}
              type="button"
              aria-pressed={cursoId === c.id}
              class={estilos.filtro}
              onClick={() => setCursoId(c.id)}
            >
              {c.titulo}
            </button>
          ))}
        </div>
      )}

      {lista.length === 0 ? (
        <p role="status" class={estilos.nada}>
          Nenhum conceito encontrado. Tente outra palavra ou outro curso.
        </p>
      ) : (
        <div class={estilos.corpo}>
          <ul class={estilos.lista}>
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  class={estilos.item}
                  aria-pressed={selecionado?.id === c.id}
                  onClick={() => setEscolhido(c.id)}
                >
                  <span class={estilos.nome}>{c.nome}</span>
                  <span class={estilos.definicao}>{c.definicao}</span>
                  <span class={estilos.rodapeItem}>
                    <CursoDoConceito c={c} />
                    <Forca caixa={c.caixa} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {selecionado && <CartaoDoConceito key={selecionado.id} c={selecionado} />}
        </div>
      )}
    </div>
  );
}
