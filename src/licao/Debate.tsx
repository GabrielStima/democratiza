import type { Debate } from './pratica.ts';
import estilos from './debate.module.css';

export const TEXTO_DO_AVISO_DO_DEBATE =
  'Aqui não existe resposta certa sobre qual leitura está correta: os pesquisadores ainda debatem. O que vale ponto é saber quem defende o quê.';

/** Selo no alto da pergunta, para a pessoa saber que está num debate e não num fato. */
export function SeloDebate() {
  return <span class={estilos.selo}>Debate acadêmico</span>;
}

/** O argumento entre aspas, de quem se pergunta a leitura. */
export function ArgumentoDoDebate({ texto }: { texto: string }) {
  return (
    <blockquote class={estilos.argumento}>
      <p>“{texto}”</p>
    </blockquote>
  );
}

function tituloDoQuadro(n: number): string {
  return n === 2 ? 'As duas leituras, lado a lado' : `As ${n} leituras, lado a lado`;
}

/** Depois de verificar: cada leitura com nome, resumo e a referência completa. */
export function QuadroDasLeituras({ debate }: { debate: Debate }) {
  return (
    <section class={estilos.quadro} aria-labelledby="quadro-leituras">
      <h2 id="quadro-leituras" class={estilos.quadroTitulo}>
        {tituloDoQuadro(debate.leituras.length)}
      </h2>
      <ul class={estilos.leituras}>
        {debate.leituras.map((l) => (
          <li key={l.nome} class={estilos.leitura}>
            <h3>{l.nome}</h3>
            <p>{l.resumo}</p>
            <p class={estilos.referencia}>
              Referência:{' '}
              {l.fonte.link ? (
                <a href={l.fonte.link} target="_blank" rel="noopener noreferrer">
                  {l.fonte.descricao}
                </a>
              ) : (
                l.fonte.descricao
              )}
            </p>
          </li>
        ))}
      </ul>
      <p class={estilos.aviso}>{TEXTO_DO_AVISO_DO_DEBATE}</p>
    </section>
  );
}
