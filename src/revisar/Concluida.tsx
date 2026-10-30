import { Capi } from '../componentes/Capi';
import { voltaEm } from '../engine/telasRevisao.ts';
import estilos from './revisar.module.css';

export type ModoSessao = 'revisao' | 'treino' | 'conceito';

export interface LinhaConceito {
  conceitoId: string;
  nome: string;
  acertou: boolean;
  de: number;
  para: number;
  voltaEmDias: number;
}

export interface DadosFim {
  modo: ModoSessao;
  xpGanho: number;
  acertos: number;
  total: number;
  tempo: string;
  cursosVindos: number;
  linhas: LinhaConceito[];
}

function subtitulo(d: DadosFim): string {
  if (d.modo === 'conceito') return 'Você praticou este conceito. Isso não muda o seu calendário.';
  const n = d.total === 1 ? '1 conceito revisado' : `${d.total} conceitos revisados`;
  const de = d.cursosVindos <= 1 ? 'do seu curso' : `vindos dos seus ${d.cursosVindos} cursos`;
  return `${n}, ${de}.`;
}

/** Tela final da revisão, do treino livre e do "Praticar agora". */
export function Concluida({ d }: { d: DadosFim }) {
  const titulo =
    d.modo === 'revisao'
      ? 'Revisão concluída!'
      : d.modo === 'treino'
        ? 'Treino concluído!'
        : 'Prática concluída!';
  return (
    <section class={estilos.fim}>
      <Capi tamanho={120} />
      <h1>{titulo}</h1>
      <p class={estilos.fimSub}>{subtitulo(d)}</p>
      {d.modo === 'treino' && (
        <p class={estilos.fimSub}>Esse treino não valeu XP e não mudou o seu calendário.</p>
      )}
      <ul class={estilos.numeros}>
        {d.modo === 'revisao' && (
          <li class={`${estilos.numero} ${estilos.nXp}`}>
            <span class={estilos.numeroRotulo}>XP ganho</span>
            <span class={estilos.numeroValor}>{d.xpGanho}</span>
          </li>
        )}
        <li class={`${estilos.numero} ${estilos.nAcertos}`}>
          <span class={estilos.numeroRotulo}>Acertos</span>
          <span class={estilos.numeroValor}>
            {d.acertos} de {d.total}
          </span>
        </li>
        <li class={`${estilos.numero} ${estilos.nTempo}`}>
          <span class={estilos.numeroRotulo}>Tempo</span>
          <span class={estilos.numeroValor}>{d.tempo}</span>
        </li>
      </ul>
      {d.modo === 'revisao' && d.linhas.length > 0 && (
        <div class={estilos.como}>
          <h2>Como ficaram seus conceitos</h2>
          <ul class={estilos.linhas}>
            {d.linhas.map((l) => (
              <li key={l.conceitoId} class={estilos.linha}>
                <span class={estilos.linhaNome}>{l.nome}</span>
                <span class={`${estilos.mudanca} ${l.acertou ? estilos.subiu : estilos.ficou}`}>
                  Força {l.de} → {l.para}
                  {l.acertou ? '' : ' (errou)'}
                </span>
                <span class={estilos.volta}>volta {voltaEm(l.voltaEmDias)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
