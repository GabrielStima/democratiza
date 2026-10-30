import { z } from 'zod';
import { fonteSchema } from './fonte.ts';

const texto = z.string().trim().min(1, 'o texto não pode ficar vazio');
const opcoes = z.array(texto).min(3, 'use de 3 a 4 opções').max(4, 'use de 3 a 4 opções');

const base = {
  conceitos: z.array(z.string()).min(1, 'cite ao menos um conceito'),
  explicacao: texto,
  fonte: fonteSchema,
  titulo_curto: z.string().trim().min(1).optional(),
};

function indiceValido(o: { opcoes: string[]; correta: number }, ctx: z.RefinementCtx) {
  if (!Number.isInteger(o.correta) || o.correta < 0 || o.correta >= o.opcoes.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['correta'],
      message: `a posição ${o.correta} não existe: use de 0 a ${o.opcoes.length - 1}`,
    });
  }
}

export const multiplaEscolhaSchema = z
  .strictObject({
    tipo: z.literal('multipla_escolha'),
    ...base,
    pergunta: texto,
    opcoes,
    correta: z.number(),
  })
  .superRefine(indiceValido);

export const verdadeiroFalsoSchema = z.strictObject({
  tipo: z.literal('verdadeiro_falso'),
  ...base,
  afirmacao: texto,
  correta: z.boolean(),
});

export const quemResolveSchema = z
  .strictObject({
    tipo: z.literal('quem_resolve'),
    ...base,
    situacao: texto,
    opcoes,
    correta: z.number(),
  })
  .superRefine(indiceValido);

export const correntesSchema = z
  .strictObject({
    tipo: z.literal('correntes'),
    ...base,
    argumento: texto,
    leituras: z
      .array(z.strictObject({ nome: texto, resumo: texto, fonte: fonteSchema }))
      .min(2, 'use 2 ou mais leituras'),
    correta: z.number(),
  })
  .superRefine((o, ctx) => {
    if (!Number.isInteger(o.correta) || o.correta < 0 || o.correta >= o.leituras.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['correta'],
        message: `a leitura ${o.correta} não existe: use de 0 a ${o.leituras.length - 1}`,
      });
    }
  });

export const classificarSchema = z
  .strictObject({
    tipo: z.literal('classificar'),
    ...base,
    pergunta: texto,
    categorias: z
      .array(z.strictObject({ nome: texto, dica: texto }))
      .min(2, 'use de 2 a 4 categorias')
      .max(4, 'use de 2 a 4 categorias'),
    itens: z.array(z.strictObject({ texto, categoria: texto })).min(2, 'use ao menos 2 itens'),
  })
  .superRefine((o, ctx) => {
    const nomes = new Set(o.categorias.map((c) => c.nome));
    o.itens.forEach((item, i) => {
      if (!nomes.has(item.categoria)) {
        ctx.addIssue({
          code: 'custom',
          path: ['itens', i, 'categoria'],
          message: `"${item.categoria}" não é uma das categorias`,
        });
      }
    });
  });

export const ordenarSchema = z.strictObject({
  tipo: z.literal('ordenar'),
  ...base,
  pergunta: texto,
  etapas: z.array(texto).min(3, 'use ao menos 3 etapas, escritas na ordem certa'),
});

export const mitoOuFatoSchema = z.strictObject({
  tipo: z.literal('mito_ou_fato'),
  ...base,
  frase: texto,
  correta: z.enum(['mito', 'fato']),
});

export const exercicioSchema = z.discriminatedUnion('tipo', [
  multiplaEscolhaSchema,
  verdadeiroFalsoSchema,
  quemResolveSchema,
  correntesSchema,
  classificarSchema,
  ordenarSchema,
  mitoOuFatoSchema,
]);

/** Pergunta de checagem de um card: não vale ponto e não tem fonte própria. */
export const checagemSchema = z
  .strictObject({
    tipo: z.literal('multipla_escolha'),
    pergunta: texto,
    opcoes,
    correta: z.number(),
    reexplicacao: texto,
  })
  .superRefine(indiceValido);

export type Exercicio = z.infer<typeof exercicioSchema>;
export type Checagem = z.infer<typeof checagemSchema>;
export type TipoExercicio = Exercicio['tipo'];
