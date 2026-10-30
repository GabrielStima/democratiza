import { z } from 'zod';
import { checagemSchema, exercicioSchema } from './exercicio.ts';
import { fonteSchema } from './fonte.ts';

const texto = z.string().trim().min(1, 'o texto não pode ficar vazio');

export const cardSchema = z.strictObject({
  titulo: texto,
  texto,
  analogia: texto.optional(),
  visual: z.string().trim().min(1).optional(),
  glossario: z.record(z.string(), texto).default({}),
  fonte: fonteSchema,
  checagem: checagemSchema.optional(),
});

export const licaoSchema = z
  .strictObject({
    titulo: texto,
    status: z.enum(['rascunho', 'revisado']),
    tipo: z.literal('desafio').optional(),
    ensina: z.array(z.string()).default([]),
    situacao: z
      .strictObject({
        texto,
        palpites: z.array(texto).length(3, 'use exatamente 3 palpites'),
      })
      .optional(),
    explicacao: z.array(cardSchema).max(4, 'use de 1 a 4 cards').optional(),
    pratica: z.array(exercicioSchema).min(1, 'a lição precisa de ao menos 1 exercício'),
    revisao: z
      .strictObject({
        por: texto,
        em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use a data no formato AAAA-MM-DD'),
      })
      .optional(),
  })
  .superRefine((l, ctx) => {
    const erro = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });

    if (l.status === 'revisado' && !l.revisao) {
      erro(['revisao'], 'lição revisada precisa dizer quem revisou e quando');
    }

    if (l.tipo === 'desafio') {
      if (l.situacao) erro(['situacao'], 'lição de desafio não tem situação');
      if (l.explicacao) erro(['explicacao'], 'lição de desafio não tem explicação');
      if (l.ensina.length > 0) erro(['ensina'], 'lição de desafio não ensina conceitos novos');
      return;
    }

    if (l.ensina.length < 1 || l.ensina.length > 3) {
      erro(['ensina'], 'cada lição ensina de 1 a 3 conceitos');
    }
    if (!l.situacao) erro(['situacao'], 'a lição precisa de uma situação');
    if (!l.explicacao || l.explicacao.length < 1) {
      erro(['explicacao'], 'a lição precisa de 1 a 4 cards de explicação');
      return;
    }
    const ultimo = l.explicacao.length - 1;
    if (!l.explicacao[ultimo]?.checagem) {
      erro(['explicacao', ultimo, 'checagem'], 'o último card precisa de checagem');
    }
    l.explicacao.forEach((card, i) => {
      for (const m of card.texto.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const termo = m[1] ?? '';
        if (!(termo in card.glossario)) {
          erro(['explicacao', i, 'glossario'], `o termo "${termo}" não tem definição no glossário`);
        }
      }
    });
  });

export type Licao = z.infer<typeof licaoSchema>;
export type Card = z.infer<typeof cardSchema>;
export { fonteSchema };
