import { useLocation } from 'preact-iso';
import { useMemo, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Forca } from '../componentes/Forca';
import { catalogo } from '../conteudo/index.ts';
import { hoje } from '../engine/relogio.ts';
import { MAX_SESSAO } from '../engine/revisao.ts';
import {
  PASSOS_DE_FORCA,
  dadosDaRevisao,
  rotuloDaForca,
  type DadosRevisao,
} from '../engine/telasRevisao.ts';
import { caderno } from '../stores/index.ts';
import estilos from './revisar.module.css';

function ComoFunciona() {
  return (
    <section class={estilos.painel} aria-labelledby="h-como">
      <h2 id="h-como">Como funciona</h2>
      <p>
        Cada conceito tem uma força de 1 a 5. Acertou, ele fica mais forte e demora mais para
        voltar. Errou, volta para o começo.
      </p>
      <ul class={estilos.passos}>
        {PASSOS_DE_FORCA.map((p) => (
          <li key={p.caixa}>
            <span class={estilos.numeroPasso}>{p.caixa}</span>
            <span>
              volta em <strong>{p.quando}</strong>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Proximas({ d, comoTabela = false }: { d: DadosRevisao; comoTabela?: boolean }) {
  return (
    <section
      class={comoTabela ? `${estilos.painel} ${estilos.painelGrande}` : estilos.painel}
      aria-labelledby="h-proximas"
    >
      <h2 id="h-proximas">Próximas revisões</h2>
      {d.proximas.length === 0 ? (
        <p>Nenhum conceito para revisar nos próximos dias.</p>
      ) : (
        <ul class={estilos.proximas}>
          {d.proximas.map((p) => (
            <li key={p.rotulo}>
              <span>{p.rotulo}</span>
              <strong>
                {p.quantidade} {p.quantidade === 1 ? 'conceito' : 'conceitos'}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Treinar({ d, semXp }: { d: DadosRevisao; semXp: boolean }) {
  const { route } = useLocation();
  const [curso, setCurso] = useState(d.cursosDeTreino[0]?.id ?? '');
  if (d.cursosDeTreino.length === 0) return null;
  return (
    <section class={estilos.painel} aria-labelledby="h-treino">
      <h2 id="h-treino">Quer treinar mais?</h2>
      <p>
        Revise os conceitos de um curso, mesmo os que ainda não venceram.
        {semXp && ' Esse treino não vale XP e não muda o seu calendário de revisões.'}
      </p>
      <label for="treino-curso" class={estilos.rotuloCampo}>
        Curso
      </label>
      <select
        id="treino-curso"
        class={estilos.campo}
        value={curso}
        onChange={(e) => setCurso(e.currentTarget.value)}
      >
        {d.cursosDeTreino.map((c) => (
          <option key={c.id} value={c.id}>
            {c.titulo}
          </option>
        ))}
      </select>
      <Botao3D
        variante="neutro"
        tamanho="pequeno"
        larga
        onClick={() => route(`/revisar/treino/${curso}`)}
      >
        Treinar este curso
      </Botao3D>
      {!semXp && <p class={estilos.aviso}>Esse treino não vale XP e não muda o seu calendário.</p>}
    </section>
  );
}

function ListaDoDia({ d }: { d: DadosRevisao }) {
  return (
    <section aria-labelledby="h-hoje" class={estilos.secao}>
      <h2 id="h-hoje">O que entra hoje</h2>
      {d.total > MAX_SESSAO && (
        <p class={estilos.nota}>
          Há {d.total} conceitos vencidos. A sessão tem no máximo {MAX_SESSAO}: entram os mais
          atrasados, e o resto fica para a próxima.
        </p>
      )}
      <ul class={estilos.vencidos}>
        {d.sessao.map((i) => (
          <li key={i.conceitoId} class={estilos.vencido}>
            <div class={estilos.vencidoTexto}>
              <strong>{i.nome}</strong>
              <span>
                {i.cursoTitulo} · visto {i.vistoHa}
              </span>
            </div>
            <Forca caixa={i.caixa} grande />
            <span class={estilos.forcaRotulo}>{rotuloDaForca(i.caixa)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function proximoTexto(d: DadosRevisao): string {
  if (d.proximoEmDias === null) return 'Termine uma lição para ter conceitos para revisar.';
  const quando = d.proximoEmDias === 1 ? 'amanhã' : `em ${d.proximoEmDias} dias`;
  return `Nenhum conceito está vencido agora. O próximo vence ${quando}. Quem revisa na hora certa lembra por mais tempo.`;
}

/** Tela Revisar: a sessão do dia (ou "tudo em dia"), próximas revisões e treino livre. */
export function Revisar() {
  const d = useMemo(() => dadosDaRevisao(caderno.value, catalogo, hoje()), [caderno.value]);
  const { route } = useLocation();
  const emDia = d.total === 0;

  return (
    <div class={estilos.pagina}>
      <div class={estilos.coluna}>
        <header class={estilos.cabeca}>
          <h1>Revisar</h1>
          <p>A Capi traz de volta os conceitos que você está começando a esquecer.</p>
        </header>

        {emDia ? (
          <section class={`${estilos.destaque} ${estilos.verde}`} aria-labelledby="h-dia">
            <div class={estilos.destaqueTexto}>
              <p class={estilos.rotuloDestaque}>Revisão de hoje</p>
              <h2 id="h-dia">{d.temCaderno ? 'Tudo em dia!' : 'Nada para revisar ainda'}</h2>
              <p>{proximoTexto(d)}</p>
            </div>
            <span class={estilos.capi}>
              <Capi tamanho={140} rounded/>
            </span>
          </section>
        ) : (
          <section class={`${estilos.destaque} ${estilos.azul}`} aria-labelledby="h-dia">
            <div class={estilos.destaqueTexto}>
              <p class={estilos.rotuloDestaque}>Revisão de hoje</p>
              <h2 id="h-dia">
                {d.total} {d.total === 1 ? 'conceito para revisar' : 'conceitos para revisar'}
              </h2>
              <p>
                Vindos {d.cursosVindos === 1 ? 'do seu curso' : `dos seus ${d.cursosVindos} cursos`}{' '}
                · cerca de {d.minutos} {d.minutos === 1 ? 'minuto' : 'minutos'} · cada acerto vale
                XP
              </p>
              <Botao3D variante="neutro" onClick={() => route('/revisar/sessao')}>
                Começar revisão
              </Botao3D>
            </div>
            <span class={estilos.capi}>
              <Capi tamanho={140} />
            </span>
          </section>
        )}

        {emDia ? <Proximas d={d} comoTabela /> : <ListaDoDia d={d} />}
      </div>

      <div class={estilos.lateral}>
        {emDia ? (
          <>
            <Treinar d={d} semXp />
            <ComoFunciona />
          </>
        ) : (
          <>
            <ComoFunciona />
            <Proximas d={d} />
            <Treinar d={d} semXp={false} />
          </>
        )}
      </div>
    </div>
  );
}
