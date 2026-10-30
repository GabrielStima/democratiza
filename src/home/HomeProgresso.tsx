import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { ROTULO_NIVEL, Selo } from '../componentes/Selo';
import { catalogo } from '../conteudo/index.ts';
import { hoje } from '../engine/relogio.ts';
import { dadosDaHome, ondeAprender, type DadosHome } from '../engine/telas.ts';
import type { Estado } from '../storage/estado.ts';
import { caderno } from '../stores/index.ts';
import { abrirMeta } from '../stores/ui.ts';
import estilos from './progresso.module.css';

function Trilho({ valor, nivel, rotulo }: { valor: number; nivel: string; rotulo: string }) {
  const v = Math.min(100, Math.max(0, Math.round(valor)));
  return (
    <div
      class={estilos.trilho}
      role="progressbar"
      aria-label={rotulo}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        class={`${estilos.preenchimento} ${estilos[`nivel_${nivel}`] ?? ''}`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function CartaoContinuar({ c }: { c: NonNullable<DadosHome['continuar']> }) {
  const posicao = c.desafio
    ? `Unidade ${c.unidade} · ${c.unidadeTitulo} · Desafio da unidade`
    : `Unidade ${c.unidade} · ${c.unidadeTitulo} · Lição ${c.numero} de ${c.totalNaUnidade}`;
  return (
    <section class={estilos.continuar} aria-label="Continuar de onde parou">
      <div class={estilos.continuarTexto}>
        <p class={estilos.continuarCurso} style={{ margin: 0 }}>
          <span class={estilos.selo}>{ROTULO_NIVEL[c.nivel]}</span>
          <span>{c.cursoTitulo}</span>
        </p>
        <h2>{c.licaoTitulo}</h2>
        <p class={estilos.continuarLinha}>{posicao}</p>
        <ol class={estilos.segmentos} aria-label="Lições da unidade">
          {c.pontos.map((p, i) => (
            <li key={i} class={`${estilos.segmento} ${estilos[`segmento_${p}`] ?? ''}`}>
              <span class="so-leitor">
                {p === 'feita' ? 'Feita' : p === 'atual' ? 'Esta lição' : 'Ainda não'}
              </span>
            </li>
          ))}
        </ol>
        <div class={estilos.continuarAcao}>
          <a href={c.destino}>{c.emAndamento ? 'Continuar' : 'Começar lição'}</a>
          <span>
            {c.conceitosNovos > 0
              ? `${c.conceitosNovos} ${c.conceitosNovos === 1 ? 'conceito novo' : 'conceitos novos'} · `
              : ''}
            cerca de {c.minutos} {c.minutos === 1 ? 'minuto' : 'minutos'}
          </span>
        </div>
      </div>
      <span class={estilos.capi}>
        <Capi tamanho={150} rounded />
      </span>
    </section>
  );
}

function Seta() {
  return (
    <svg
      class={estilos.seta}
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke-width="2.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ListaDeCursos({ d }: { d: DadosHome }) {
  return (
    <section aria-labelledby="h-cursos" class={estilos.secao}>
      <div class={estilos.tituloSecao}>
        <h2 id="h-cursos">Seus cursos</h2>
        <a href="/cursos" class={estilos.linkAzul}>
          Ver todos os cursos
        </a>
      </div>
      <ul class={estilos.cursos}>
        {d.cursos.map((c) => (
          <li key={c.id}>
            <a
              href={`/c/${c.id}`}
              class={`${estilos.curso} ${c.emDestaque ? estilos.cursoAtual : ''}`}
            >
              <div class={estilos.cursoCorpo}>
                <div class={estilos.cursoTopo}>
                  <Selo nivel={c.nivel} />
                  <span class={estilos.cursoTitulo}>{c.titulo}</span>
                  {c.emDestaque && <span class={estilos.emDestaque}>· em destaque</span>}
                </div>
                <div class={estilos.barraLinha}>
                  <Trilho
                    valor={c.progresso.percentual}
                    nivel={c.nivel}
                    rotulo={`Progresso em ${c.titulo}`}
                  />
                  <span class={estilos.contagemLicoes}>
                    {c.progresso.feitas} de {c.progresso.total} lições
                  </span>
                </div>
                {c.proxima && <span class={estilos.proxima}>Próxima: {c.proxima}</span>}
              </div>
              <Seta />
            </a>
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
    <section aria-labelledby="h-progresso" class={estilos.progressoCurso}>
      <div class={estilos.tituloSecao}>
        <h2 id="h-progresso" style={{ margin: 0, fontSize: '24px' }}>
          Seu progresso no curso
        </h2>
        <a href={`/c/${c.id}`} class={estilos.linkAzul}>
          Ver o curso
        </a>
      </div>
      <div class={estilos.barraLinha}>
        <Trilho
          valor={c.progresso.percentual}
          nivel={c.nivel}
          rotulo={`Progresso em ${c.titulo}`}
        />
        <span class={estilos.contagemLicoes}>
          {c.progresso.feitas} de {c.progresso.total} lições
        </span>
      </div>
      <div class={estilos.fatos}>
        <span>
          <b>
            {conceitos} de {curso.ensina.length}
          </b>{' '}
          conceitos no caderno
        </span>
        {c.progresso.unidadeAtual && (
          <span>
            <b>
              Unidade {c.progresso.unidadeAtual} de {c.progresso.totalUnidades}
            </b>
          </span>
        )}
      </div>
      <p class={estilos.aviso}>
        Outros cursos aparecem aqui quando você aprende os conceitos que eles pedem.
      </p>
    </section>
  );
}

function Cadeado() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ParaExplorar({ d }: { d: DadosHome }) {
  if (d.explorar.length === 0) return null;
  return (
    <section aria-labelledby="h-explorar" class={estilos.secao}>
      <h2 id="h-explorar" style={{ margin: 0, fontSize: '24px' }}>
        Para explorar
      </h2>
      <ul class={estilos.explorar}>
        {d.explorar.map((c) => (
          <li key={c.id}>
            <div class={`${estilos.explorarCartao} ${c.liberado ? '' : estilos.bloqueado}`}>
              <div class={estilos.explorarTopo}>
                <Selo nivel={c.nivel} />
                {c.liberado ? (
                  <span class={`${estilos.estadoCurso} ${estilos.liberado}`}>Liberado agora</span>
                ) : (
                  <span class={estilos.estadoCurso}>
                    <Cadeado />
                    Bloqueado
                  </span>
                )}
              </div>
              <h3 class={estilos.explorarTitulo}>{c.titulo}</h3>
              {c.liberado ? (
                <>
                  <p class={estilos.explorarTexto}>Você já tem os conceitos que este curso pede.</p>
                  <span class={estilos.explorarAcao}>
                    <Botao3D href={`/c/${c.id}`} variante="neutro" tamanho="pequeno">
                      Começar curso
                    </Botao3D>
                  </span>
                </>
              ) : (
                <>
                  <p class={estilos.explorarTexto}>
                    {c.faltantes.length === 1
                      ? 'Falta 1 conceito para liberar:'
                      : `Faltam ${c.faltantes.length} conceitos para liberar:`}
                  </p>
                  <ul class={estilos.chips}>
                    {c.faltantes.map((f) => (
                      <li key={f.id}>{f.nome}</li>
                    ))}
                  </ul>
                  {ondeAprender(c.faltantes) && (
                    <p class={estilos.ondeAprende}>{ondeAprender(c.faltantes)}</p>
                  )}
                </>
              )}
            </div>
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

function Chama() {
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="var(--laranja-chama)"
      stroke="var(--laranja-borda)"
      stroke-width="1.6"
      stroke-linejoin="round"
    >
      <path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .2 2 1 3 2 3.5C11 9 11.5 5 12 2z" />
    </svg>
  );
}

function Lateral({ d }: { d: DadosHome }) {
  const dias = d.ofensiva.dias;
  const recorde = d.ofensiva.recorde;
  const v = d.revisao.vencidos;
  const percentualMeta = Math.min(100, Math.round((d.meta.xp / d.meta.meta) * 100));
  return (
    <aside class={estilos.lateral} aria-label="Seu dia">
      <section class={`${estilos.cartaoLateral} ${estilos.ofensiva}`}>
        <h2 class="so-leitor">Ofensiva</h2>
        <div class={estilos.ofensivaTopo}>
          <Chama />
          <div class={estilos.ofensivaDias}>
            <strong>
              {dias} {dias === 1 ? 'dia seguido' : 'dias seguidos'}
            </strong>
            <span>
              {d.ofensiva.emRisco ? 'Estude hoje para manter · ' : ''}Recorde: {recorde}{' '}
              {recorde === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>
        <ol class={estilos.semana}>
          {d.ofensiva.semana.map((s) => (
            <li key={s.dia} class={s.estudou ? estilos.estudou : ''}>
              <span class={estilos.bolinha} aria-hidden="true" />
              <span aria-hidden="true">{LETRA_DO_DIA(s.dia)}</span>
              <span class="so-leitor">
                {NOME_DO_DIA(s.dia)}: {s.estudou ? 'estudou' : 'não estudou'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section class={estilos.cartaoLateral}>
        <div class={estilos.linhaTitulo}>
          <h2>Meta de hoje</h2>
          <button type="button" class={estilos.valorMeta} onClick={() => abrirMeta('mudar')}>
            {d.meta.xp} / {d.meta.meta} XP<span class="so-leitor"> (mudar a meta)</span>
          </button>
        </div>
        <div
          class={estilos.trilhoMeta}
          role="progressbar"
          aria-label="Meta diária"
          aria-valuenow={percentualMeta}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${percentualMeta}%` }} />
        </div>
        <p class={estilos.nota}>
          {d.meta.atingida ? 'Meta de hoje batida! ' : ''}Soma o XP de todos os cursos.
        </p>
      </section>

      <section class={estilos.cartaoLateral}>
        <h2>Revisão de hoje</h2>
        {v > 0 ? (
          <>
            <p class={estilos.texto}>
              {v === 1
                ? '1 conceito está quase sendo esquecido'
                : `${v} conceitos estão quase sendo esquecidos`}
              {d.revisao.cursos > 1 ? `, vindos dos seus ${d.revisao.cursos} cursos.` : '.'}
            </p>
            <Botao3D href="/revisar" variante="neutro" tamanho="pequeno" larga>
              Revisar agora
            </Botao3D>
          </>
        ) : (
          <p class={estilos.texto}>Nada para revisar hoje</p>
        )}
      </section>

      <section class={estilos.cartaoLateral}>
        <div class={estilos.linhaTitulo}>
          <h2>Seu caderno</h2>
          <span class={estilos.valorVerde}>
            {d.caderno.total} {d.caderno.total === 1 ? 'conceito' : 'conceitos'}
          </span>
        </div>
        {d.caderno.recentes.length > 0 && (
          <ul class={estilos.recentes}>
            {d.caderno.recentes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <a href="/caderno" class={estilos.linkAzul}>
          Abrir caderno
        </a>
      </section>
    </aside>
  );
}

/** Home de quem já tem progresso (inclui a variante de um curso só). */
export function HomeProgresso({ estado }: { estado: Estado }) {
  const d = dadosDaHome(estado, caderno.value, catalogo, hoje());
  return (
    <div class={estilos.pagina}>
      <div class={estilos.principal}>
        <header class={estilos.cabeca}>
          <h1>Bom te ver de novo!</h1>
          <p>
            {d.umCursoSo
              ? 'Continue de onde parou.'
              : `Você está fazendo ${d.cursos.length} ${d.cursos.length === 1 ? 'curso' : 'cursos'}. Continue de onde parou.`}
          </p>
        </header>
        {d.continuar ? (
          <CartaoContinuar c={d.continuar} />
        ) : (
          <section class={estilos.progressoCurso}>
            <h2 style={{ margin: 0 }}>Tudo feito por enquanto</h2>
            <p class={estilos.aviso}>
              Você terminou as lições liberadas. Revise seus conceitos para não esquecer.
            </p>
          </section>
        )}
        {d.umCursoSo ? <ProgressoNoCurso d={d} /> : <ListaDeCursos d={d} />}
        <ParaExplorar d={d} />
      </div>
      <Lateral d={d} />
    </div>
  );
}
