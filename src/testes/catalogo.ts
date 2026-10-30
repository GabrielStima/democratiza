import { join } from 'node:path';
import { lerPasta } from '../../vite-plugins/leitor.ts';
import { construirConteudo } from '../content-schema/construir.ts';
import type { Catalogo } from '../content-schema/tipos.ts';
import { estadoInicial, type Caderno, type Estado } from '../storage/estado.ts';

/** Catálogo real do projeto (conteúdo Lorem), com rascunhos, para testar o motor. */
export function catalogoLorem(): Catalogo {
  const r = construirConteudo(lerPasta(join(__dirname, '../../content')), {
    mostrarRascunhos: true,
  });
  if (r.erros.length > 0) throw new Error('O conteúdo Lorem do projeto está inválido.');
  return r.catalogo;
}

export function estadoDeTeste(hoje = '2026-10-28', trocar: Partial<Estado> = {}): Estado {
  return { ...estadoInicial(50, hoje), ...trocar };
}

export const semCaderno: Caderno = {};
