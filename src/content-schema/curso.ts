import { z } from 'zod';

export const NIVEIS = ['introducao', 'aprofundamento', 'modulo'] as const;
export type Nivel = (typeof NIVEIS)[number];

export const cursoSchema = z.strictObject({
  titulo: z.string().trim().min(1),
  nivel: z.enum(NIVEIS),
  descricao: z.string().trim().min(1),
  cor: z.string().trim().min(1),
  requer_conceitos: z.array(z.string()).default([]),
});

export const unidadeSchema = z.strictObject({
  titulo: z.string().trim().min(1),
  descricao: z.string().trim().min(1),
});

export type CursoArquivo = z.infer<typeof cursoSchema>;
export type UnidadeArquivo = z.infer<typeof unidadeSchema>;
