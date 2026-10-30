import { z } from 'zod';

export const VERSAO_ATUAL = 1;

const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use a data no formato AAAA-MM-DD');
const inteiro = z.number().int().min(0);

export const entradaCadernoSchema = z.object({
  conceitoId: z.string().min(1),
  /** Caixa do Leitner, de 1 (mais frágil) a 5. */
  caixa: z.number().int().min(1).max(5),
  proximaRevisao: dia,
  ultimaRevisao: dia.nullable(),
  aprendidoEm: dia,
  licaoId: z.string().min(1),
});

export const estadoSchema = z.object({
  versao: z.literal(VERSAO_ATUAL),
  xp: inteiro,
  xpHoje: z.object({ dia, valor: inteiro }),
  ofensiva: z.object({ atual: inteiro, recorde: inteiro, ultimoDia: dia.nullable() }),
  /** Últimos 30 dias com estudo, para os pontinhos da semana. */
  diasEstudados: z.array(dia),
  cursoAtual: z.string().nullable(),
  licoesConcluidas: z.record(z.string(), z.object({ acertos: inteiro, total: inteiro, em: dia })),
  /** Aceita campos extras: as etapas da lição (M3 e M4) guardam mais coisas aqui. */
  licaoEmAndamento: z
    .looseObject({
      id: z.string().min(1),
      etapa: z.enum(['situacao', 'explicacao', 'checagem', 'fim', 'pratica']),
      card: inteiro.optional(),
      palpite: inteiro.optional(),
    })
    .nullable(),
  config: z.object({
    metaDiaria: z.union([z.literal(20), z.literal(50), z.literal(100)]),
    som: z.boolean(),
  }),
});

export type Estado = z.infer<typeof estadoSchema>;
export type EntradaCaderno = z.infer<typeof entradaCadernoSchema>;
export type Caderno = Record<string, EntradaCaderno>;
export type MetaDiaria = Estado['config']['metaDiaria'];

/** Estado de quem acabou de escolher a meta e ainda não estudou nada. */
export function estadoInicial(metaDiaria: MetaDiaria, hoje: string): Estado {
  return {
    versao: VERSAO_ATUAL,
    xp: 0,
    xpHoje: { dia: hoje, valor: 0 },
    ofensiva: { atual: 0, recorde: 0, ultimoDia: null },
    diasEstudados: [],
    cursoAtual: null,
    licoesConcluidas: {},
    licaoEmAndamento: null,
    config: { metaDiaria, som: true },
  };
}
