import { z } from 'zod';

/** Referência escrita no lugar onde é usada: obra + página, ou lei + artigo. */
export const fonteSchema = z.strictObject({
  descricao: z
    .string()
    .trim()
    .min(5, 'a fonte precisa de uma descrição específica (obra e página, ou lei e artigo)'),
  link: z.url('o link precisa ser um endereço completo, como https://...').optional(),
});

export type Fonte = z.infer<typeof fonteSchema>;
