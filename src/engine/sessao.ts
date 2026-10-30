import type { Catalogo, CursoCatalogo } from '../content-schema/tipos.ts';
import type { Caderno, Estado } from '../storage/estado.ts';
import { conceitosAprendidos, novosDesbloqueios } from './desbloqueio.ts';
import { registrarDiaEstudado, registrarEstudo } from './ofensiva.ts';
import { partirIdLicao } from './progresso.ts';
import {
  INTERVALOS_DIAS,
  aplicarRevisao,
  novaEntrada,
  registrarResultado,
  type ResultadoConceito,
} from './revisao.ts';
import { adicionarXp, xpDaLicao } from './xp.ts';

export interface ResultadoLicao {
  /** Id completo "curso/unidade/licao". */
  licaoId: string;
  /** Acertos de primeira. */
  acertosPrimeira: number;
  total: number;
  /** XP somado durante a Prática (10 por acerto de primeira, 5 depois de errar). */
  xpBruto: number;
  /** Conceitos de perguntas que a pessoa errou. */
  conceitosErrados: string[];
}

export interface ConclusaoLicao {
  estado: Estado;
  caderno: Caderno;
  xpGanho: number;
  refeita: boolean;
  /** Conceitos que entraram agora no caderno (os "Novo" da tela final). */
  novosConceitos: string[];
  desbloqueios: CursoCatalogo[];
}

/** Estudo do dia: soma XP (se houver), atualiza ofensiva e dias estudados. */
function registrarDia(estado: Estado, pontos: number, dia: string): Estado {
  const comXp = adicionarXp(estado, pontos, dia);
  return {
    ...comXp,
    ofensiva: registrarEstudo(estado.ofensiva, dia),
    diasEstudados: registrarDiaEstudado(estado.diasEstudados, dia, dia),
  };
}

/**
 * Fecha uma lição: grava como concluída, soma XP (zero se já era concluída),
 * atualiza a ofensiva e põe os conceitos novos na caixa 1 do caderno.
 */
export function concluirLicao(
  estado: Estado,
  caderno: Caderno,
  catalogo: Catalogo,
  r: ResultadoLicao,
  dia: string,
): ConclusaoLicao {
  const partes = partirIdLicao(r.licaoId);
  const curso = catalogo.cursos.find((c) => c.id === partes?.cursoId);
  const licao = curso?.unidades
    .find((u) => u.id === partes?.unidadeId)
    ?.licoes.find((l) => l.id === partes?.licaoId);
  if (!partes || !curso || !licao) throw new Error(`Lição desconhecida: ${r.licaoId}`);

  const refeita = r.licaoId in estado.licoesConcluidas;
  const xpGanho = xpDaLicao(refeita, r.xpBruto);

  const novoCaderno: Caderno = { ...caderno };
  const novosConceitos: string[] = [];
  for (const id of licao.ensina) {
    if (!novoCaderno[id]) {
      novoCaderno[id] = novaEntrada(id, r.licaoId, dia);
      novosConceitos.push(id);
    }
  }
  // Conceito de pergunta errada volta para a caixa 1.
  for (const id of new Set(r.conceitosErrados)) {
    const e = novoCaderno[id];
    if (e && !novosConceitos.includes(id)) novoCaderno[id] = registrarResultado(e, false, dia);
  }

  const base = registrarDia(estado, xpGanho, dia);
  const novoEstado: Estado = {
    ...base,
    cursoAtual: partes.cursoId,
    licaoEmAndamento: null,
    licoesConcluidas: refeita
      ? estado.licoesConcluidas
      : {
          ...estado.licoesConcluidas,
          [r.licaoId]: { acertos: r.acertosPrimeira, total: r.total, em: dia },
        },
  };

  return {
    estado: novoEstado,
    caderno: novoCaderno,
    xpGanho,
    refeita,
    novosConceitos,
    desbloqueios: novosDesbloqueios(
      catalogo,
      conceitosAprendidos(caderno),
      conceitosAprendidos(novoCaderno),
    ),
  };
}

export interface MudancaConceito {
  conceitoId: string;
  de: number;
  para: number;
  /** Em quantos dias o conceito volta. */
  voltaEmDias: number;
}

export interface ConclusaoRevisao {
  estado: Estado;
  caderno: Caderno;
  xpGanho: number;
  mudancas: MudancaConceito[];
}

/**
 * Fecha uma sessão de revisão. No treino livre nada muda (sem XP, sem ofensiva, sem caixas).
 */
export function concluirRevisao(
  estado: Estado,
  caderno: Caderno,
  resultados: ResultadoConceito[],
  xpBruto: number,
  dia: string,
  modo: 'revisao' | 'treino' = 'revisao',
): ConclusaoRevisao {
  if (modo === 'treino') return { estado, caderno, xpGanho: 0, mudancas: [] };
  const novoCaderno = aplicarRevisao(caderno, resultados, dia, 'revisao');
  const mudancas: MudancaConceito[] = [];
  for (const r of resultados) {
    const antes = caderno[r.conceitoId];
    const depois = novoCaderno[r.conceitoId];
    if (antes && depois) {
      mudancas.push({
        conceitoId: r.conceitoId,
        de: antes.caixa,
        para: depois.caixa,
        voltaEmDias: INTERVALOS_DIAS[depois.caixa - 1] ?? 1,
      });
    }
  }
  return {
    estado: registrarDia(estado, xpBruto, dia),
    caderno: novoCaderno,
    xpGanho: xpBruto,
    mudancas,
  };
}
