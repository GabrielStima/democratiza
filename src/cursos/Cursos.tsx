import { useMemo, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { ROTULO_NIVEL, Selo } from '../componentes/Selo';
import { catalogo } from '../conteudo/index.ts';
import {
  dadosDosCursos,
  filtrarCursos,
  resumoDoCurso,
  type CursoDoCatalogo,
} from '../engine/telasCursos.ts';
import { caderno, estado } from '../stores/index.ts';
import estilos from './cursos.module.css';

const STATUS: Record<CursoDoCatalogo['estado'], string> = {
  andamento: '',
  liberado: 'Liberado',
  bloqueado: 'Bloqueado',
  concluido: 'Concluído',
};

function CartaoCurso({ c }: { c: CursoDoCatalogo }) {
  const comProgresso = c.estado === 'andamento' || c.estado === 'concluido';
  const status = c.estado === 'andamento' ? `${c.percentual}% feito` : STATUS[c.estado];
  return (
    <li
      class={`${estilos.cartao} ${estilos[`nivel_${c.nivel}`] ?? ''} ${estilos[`estado_${c.estado}`] ?? ''}`}
    >
      <div class={estilos.topo}>
        <Selo nivel={c.nivel} />
        <span class={estilos.status}>{status}</span>
      </div>
      <h3 class={estilos.titulo}>{c.titulo}</h3>
      <p class={estilos.descricao}>{c.descricao}</p>
      <p class={estilos.meta}>{resumoDoCurso(c)}</p>
      {comProgresso && (
        <div
          class={estilos.trilho}
          role="progressbar"
          aria-label={`Progresso em ${c.titulo}`}
          aria-valuenow={c.percentual}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div class={estilos.preenchimento} style={{ width: `${c.percentual}%` }} />
        </div>
      )}
      {c.estado === 'bloqueado' && (
        <div class={estilos.faltam}>
          <p class={estilos.faltamTitulo}>Faltam estes conceitos:</p>
          <ul class={estilos.chips}>
            {c.faltantes.map((f) => (
              <li key={f.id} class={estilos.chip}>
                {f.nome}
              </li>
            ))}
          </ul>
          {c.ondeAprende && <p class={estilos.onde}>{c.ondeAprende}</p>}
        </div>
      )}
      {c.estado !== 'bloqueado' && (
        <div class={estilos.acao}>
          <Botao3D
            href={`/c/${c.id}`}
            variante={c.estado === 'andamento' ? 'primario' : 'neutro'}
            tamanho="pequeno"
          >
            {c.estado === 'andamento'
              ? 'Continuar'
              : c.estado === 'concluido'
                ? 'Rever curso'
                : 'Começar curso'}
            <span class="so-leitor"> {c.titulo}</span>
          </Botao3D>
        </div>
      )}
    </li>
  );
}

/** Catálogo de cursos: três níveis, busca e o estado de cada curso. */
export function Cursos() {
  const [busca, setBusca] = useState('');
  const todos = dadosDosCursos(estado.value, caderno.value, catalogo);
  const niveis = useMemo(() => filtrarCursos(todos, busca), [todos, busca]);
  const total = niveis.reduce((n, x) => n + x.cursos.length, 0);
  return (
    <div class={estilos.pagina}>
      <header class={estilos.cabecalho}>
        <div>
          <h1>Cursos</h1>
          <p class={estilos.intro}>
            Comece pela Introdução. Os outros cursos são liberados quando você aprende os conceitos
            que eles pedem, venham de qualquer curso.
          </p>
        </div>
        <form class={estilos.busca} role="search" onSubmit={(e) => e.preventDefault()}>
          <label for="busca-curso">Buscar curso</label>
          <input
            id="busca-curso"
            type="search"
            placeholder="Ex.: eleições"
            value={busca}
            autoComplete="off"
            onInput={(e) => setBusca(e.currentTarget.value)}
          />
        </form>
      </header>
      <p class="so-leitor" role="status">
        {total === 1 ? '1 curso encontrado' : `${total} cursos encontrados`}
      </p>
      {niveis.length === 0 && (
        <p class={estilos.vazio}>
          {todos.every((n) => n.cursos.length === 0)
            ? 'Os primeiros cursos ainda estão sendo escritos e revisados. Volte em breve.'
            : `Nenhum curso encontrado para “${busca.trim()}”. Tente outra palavra.`}
        </p>
      )}
      {niveis.map((n) => (
        <section key={n.nivel} class={estilos.nivel} aria-labelledby={`nivel-${n.nivel}`}>
          <div class={estilos.nivelCabeca}>
            <h2 id={`nivel-${n.nivel}`} class={estilos[`titulo_${n.nivel}`] ?? ''}>
              {n.nome}
            </h2>
            <p>{n.descricao}</p>
          </div>
          <ul class={estilos.grade} aria-label={`Cursos de ${ROTULO_NIVEL[n.nivel]}`}>
            {n.cursos.map((c) => (
              <CartaoCurso key={c.id} c={c} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
