import { z } from 'zod';
import { fonteSchema } from './fonte.ts';

const texto = (campo: string) => z.string().trim().min(1, `${campo} não pode ficar vazio`);

export const conceitoSchema = z.strictObject({
  id: texto('o id'),
  nome: texto('o nome'),
  definicao: texto('a definição'),
  exemplo: texto('o exemplo'),
  nao_confunda: texto('o "não confunda com"'),
  requer: z.array(z.string()).default([]),
  fonte: fonteSchema,
});

export type Conceito = z.infer<typeof conceitoSchema>;
