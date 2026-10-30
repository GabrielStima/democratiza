import { Botao3D } from '../componentes/Botao3D';
import { BarraProgresso } from '../componentes/BarraProgresso';
import { Cartao } from '../componentes/Cartao';
import { Selo } from '../componentes/Selo';
import { catalogo } from '../conteudo/index.ts';
import { hoje } from '../engine/relogio.ts';
import { dadosDaHome, type DadosHome } from '../engine/telas.ts';
import type { Estado } from '../storage/estado.ts';
import { caderno } from '../stores/index.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './home.module.css';

function CartaoContinuar({ c }: { c: NonNullable<DadosHome['continuar']> }) {
  return (
    <Cartao destaque class={estilos.continuar}>
      <Selo nivel={c.nivel} />
      <p class={estilos.cursoDoCartao}>{c.cursoTitulo}</p>
      <h2>{c.licaoTitulo}</h2>
      <p class={estilos.mudo}>
        {c.desafio
          ? `Unidade ${c.unidade} · Desafio da unidade`
          : `Unidade ${c.unidade} · Lição ${c.numero} de ${c.totalNaUnidade}`}
      </p>
      <ol class={estilos.pontos} aria-label="Lições da unidade">
        {c.pontos.map((p, i) => (
          <li key={i} class={`${estilos.ponto} ${estilos[`ponto_${p}`]}`}>
            <span class="so-leitor">
              {p === 'feita' ? 'Feita' : p === 'atual' ? 'Esta lição' : 'Ainda não'}
            </span>
          </li>
        ))}
      </ol>
      <p class={estilos.mudo}>
        {c.conceitosNovos > 0
          ? `${c.conceitosNovos} ${c.conceitosNovos === 1 ? 'conceito novo' : 'conceitos novos'} · `
          : ''}
        cerca de {c.minutos} {c.minutos === 1 ? 'minuto' : 'minutos'}
      </p>
      <Botao3D href={c.destino}>{c.emAndamento ? 'Continuar' : 'Começar lição'}</Botao3D>
    </Cartao>
  );
}

function ListaDeCursos({ d }: { d: DadosHome }) {
  return (
    <section aria-labelledby="h-cursos">
      <h2 id="h-cursos" class={estilos.secaoH}>
        Seus cursos
      </h2>
      <ul class={estilos.lista}>
        {d.cursos.map((c) => (
          <li key={c.id}>
            <Cartao>
              <div class={estilos.linhaCurso}>
                <Selo nivel={c.nivel} />
                {c.emDestaque && <span class={estilos.destaque}>em destaque</span>}
              </div>
              <h3>
                <a href={`/c/${c.id}`}>{c.titulo}</a>
              </h3>
              <p class={estilos.mudo}>
                {c.progresso.feitas} de {c.progresso.total} lições
              </p>
              <BarraProgresso valor={c.progresso.percentual} rotulo={`Progresso em ${c.titulo}`} />
              {c.proxima && <p class={estilos.mudo}>Próxima: {c.proxima}</p>}
            </Cartao>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProgressoNoCurso({ d }: { d: DadosHome }) {
  const c = d.cursos[0];
  const curso = catalogo.cursos.find((x) => x.id === c?.id);
  if (!c || !curso) return null;
  const conceitos = curso.ensina.filter((id) => id in caderno.value).length;
  return (
    <section aria-labelledby="h-progresso">
      <h2 id="h-progresso" class={estilos.secaoH}>
        Seu progresso no curso
      </h2>
      <Cartao>
        <h3>
          <a href={`/c/${c.id}`}>{c.titulo}</a>
        </h3>
        <BarraProgresso valor={c.progresso.percentual} rotulo={`Progresso em ${c.titulo}`} />
        <p>
          {c.progresso.feitas} de {c.progresso.total} lições
        </p>
        <p>
          {conceitos} de {curso.ensina.length} conceitos no caderno
        </p>
        {c.progresso.unidadeAtual && (
          <p class={estilos.mudo}>
            Unidade {c.progresso.unidadeAtual} de {c.progresso.totalUnidades}
          </p>
        )}
        <p class={estilos.aviso}>
          Outros cursos aparecem aqui quando você aprende os conceitos que eles pedem.
        </p>
        <a href={`/c/${c.id}`}>Ver o curso</a>
      </Cartao>
    </section>
  );
}

function ParaExplorar({ d }: { d: DadosHome }) {
  if (d.explorar.length === 0) return null;
  return (
    <section aria-labelledby="h-explorar">
      <h2 id="h-explorar" class={estilos.secaoH}>
        Para explorar
      </h2>
      <ul class={estilos.lista}>
        {d.explorar.map((c) => (
          <li key={c.id}>
            <Cartao>
              <Selo nivel={c.nivel} />
              <h3>{c.liberado ? <a href={`/c/${c.id}`}>{c.titulo}</a> : c.titulo}</h3>
              <p class={estilos.mudo}>{c.descricao}</p>
              {c.liberado ? (
                <Botao3D href={`/c/${c.id}`} variante="secundario">
                  Começar curso
                </Botao3D>
              ) : (
                <>
                  <p>
                    <strong>Faltam estes conceitos:</strong>
                  </p>
                  <ul class={estilos.faltantes}>
                    {c.faltantes.map((f) => (
                      <li key={f.id}>
                        {f.nome}
                        {f.cursoTitulo && (
                          <span class={estilos.mudo}> · aprenda em {f.cursoTitulo}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Cartao>
          </li>
        ))}
      </ul>
    </section>
  );
}

const LETRA_DO_DIA = (dia: string) =>
  new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase();
const NOME_DO_DIA = (dia: string) =>
  new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });

function Lateral({ d }: { d: DadosHome }) {
  return (
    <aside class={estilos.lateral} aria-label="Seu dia">
      <Cartao>
        <h2 class={estilos.cartaoH}>Ofensiva</h2>
        <p class={estilos.grande}>
          {d.ofensiva.dias} {d.ofensiva.dias === 1 ? 'dia' : 'dias'}
        </p>
        <p class={estilos.mudo}>
          {d.ofensiva.emRisco ? 'Estude hoje para manter. ' : ''}Recorde: {d.ofensiva.recorde}
        </p>
        <ol class={estilos.semana}>
          {d.ofensiva.semana.map((s) => (
            <li key={s.dia} class={s.estudou ? estilos.estudou : ''}>
              <span class={estilos.bolinha} aria-hidden="true">
                {s.estudou ? '✓' : ''}
              </span>
              <span aria-hidden="true">{LETRA_DO_DIA(s.dia)}</span>
              <span class="so-leitor">
                {NOME_DO_DIA(s.dia)}: {s.estudou ? 'estudou' : 'não estudou'}
              </span>
            </li>
          ))}
        </ol>
      </Cartao>

      <Cartao>
        <h2 class={estilos.cartaoH}>Meta de hoje</h2>
        <button type="button" class={estilos.metaBotao} onClick={() => abrirMeta('mudar')}>
          <span class={estilos.grande}>
            {d.meta.xp} / {d.meta.meta} XP
          </span>
          <span class="so-leitor"> (mudar a meta)</span>
        </button>
        <BarraProgresso valor={(d.meta.xp / d.meta.meta) * 100} rotulo="Meta de hoje" />
        <p class={estilos.mudo}>
          {d.meta.atingida ? 'Meta de hoje batida! ' : ''}Soma o XP de todos os cursos
        </p>
      </Cartao>

      <Cartao>
        <h2 class={estilos.cartaoH}>Revisão de hoje</h2>
        {d.revisao.vencidos > 0 ? (
          <>
            <p class={estilos.grande}>
              {d.revisao.vencidos} {d.revisao.vencidos === 1 ? 'conceito' : 'conceitos'}
            </p>
            <Botao3D href="/revisar" variante="secundario">
              Revisar agora
            </Botao3D>
          </>
        ) : (
          <p>Nada para revisar hoje</p>
        )}
      </Cartao>

      <Cartao>
        <h2 class={estilos.cartaoH}>Seu caderno</h2>
        <p class={estilos.grande}>
          {d.caderno.total} {d.caderno.total === 1 ? 'conceito' : 'conceitos'}
        </p>
        {d.caderno.recentes.length > 0 && (
          <ul class={estilos.recentes}>
            {d.caderno.recentes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <a href="/caderno">Abrir caderno</a>
      </Cartao>
    </aside>
  );
}

/** Home de quem já tem progresso (inclui a variante de um curso só). */
export function HomeProgresso({ estado }: { estado: Estado }) {
  const d = dadosDaHome(estado, caderno.value, catalogo, hoje());
  return (
    <div class={estilos.progresso}>
      <div class={estilos.principal}>
        <header>
          <h1>Bom te ver de novo!</h1>
          <p class={estilos.mudo}>
            {d.umCursoSo
              ? 'Continue de onde parou.'
              : `Você está fazendo ${d.cursos.length} ${d.cursos.length === 1 ? 'curso' : 'cursos'}. Continue de onde parou.`}
          </p>
        </header>
        {d.continuar ? (
          <CartaoContinuar c={d.continuar} />
        ) : (
          <Cartao>
            <h2>Tudo feito por enquanto</h2>
            <p>Você terminou as lições liberadas. Revise seus conceitos para não esquecer.</p>
          </Cartao>
        )}
        {d.umCursoSo ? <ProgressoNoCurso d={d} /> : <ListaDeCursos d={d} />}
        <ParaExplorar d={d} />
      </div>
      <Lateral d={d} />
    </div>
  );
}
