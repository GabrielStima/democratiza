import type { Exercicio } from '../content-schema/exercicio.ts';
import type { Licao } from '../content-schema/licao.ts';
import type { Catalogo } from '../content-schema/tipos.ts';
import { idLicao, listarLicoes } from '../engine/progresso.ts';
import { apresentar, type Apresentacao } from '../licao/pratica.ts';

/** Uma pergunta da sessão: de qual conceito vem e como aparece na tela. */
export interface ItemSessao {
  conceitoId: string;
  licaoId: string;
  ex: Exercicio;
  apresentacao: Apresentacao;
}

export interface LicaoCarregada {
  id: string;
  licao: Licao;
}

/**
 * Lições onde o conceito aparece (ensinado ou praticado), com a lição em que a pessoa
 * aprendeu na frente. É de onde saem as perguntas.
 */
export function licoesDoConceito(
  catalogo: Catalogo,
  conceitoId: string,
  aprendidoEm?: string,
): string[] {
  const ids = catalogo.cursos.flatMap((curso) =>
    listarLicoes(curso)
      .filter(
        (l) => l.licao.ensina.includes(conceitoId) || l.licao.conceitosPratica.includes(conceitoId),
      )
      .map((l) => idLicao(l.cursoId, l.unidadeId, l.licaoId)),
  );
  return aprendidoEm && ids.includes(aprendidoEm)
    ? [aprendidoEm, ...ids.filter((i) => i !== aprendidoEm)]
    : ids;
}

function candidatos(conceitoId: string, licoes: LicaoCarregada[]): ItemSessao[] {
  return licoes.flatMap(({ id, licao }) =>
    licao.pratica.flatMap<ItemSessao>((ex) => {
      const apresentacao = ex.conceitos.includes(conceitoId) ? apresentar(ex) : null;
      return apresentacao ? [{ conceitoId, licaoId: id, ex, apresentacao }] : [];
    }),
  );
}

function giro(texto: string): number {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) % 100_003;
  return h;
}

/**
 * Um exercício de prática do conceito. A escolha varia de um dia para o outro, mas
 * no mesmo dia é sempre a mesma (recarregar a página não troca a pergunta).
 */
export function escolherExercicio(
  conceitoId: string,
  licoes: LicaoCarregada[],
  dia: string,
): ItemSessao | null {
  const lista = candidatos(conceitoId, licoes);
  return lista[giro(`${conceitoId}|${dia}`) % Math.max(1, lista.length)] ?? null;
}

/** Todos os exercícios do conceito (até 5), para o "Praticar agora" do Caderno. */
export function exerciciosDoConceito(conceitoId: string, licoes: LicaoCarregada[]): ItemSessao[] {
  return candidatos(conceitoId, licoes).slice(0, 5);
}
