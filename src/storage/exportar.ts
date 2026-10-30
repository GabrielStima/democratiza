import { z } from 'zod';
import {
  entradaCadernoSchema,
  VERSAO_ATUAL,
  type Caderno,
  type EntradaCaderno,
  type Estado,
} from './estado.ts';
import {
  aplicarRenomeadosCaderno,
  lerEstado,
  type Migracao,
  type Renomeados,
} from './migracoes.ts';

const arquivoSchema = z.object({
  app: z.literal('democratiza'),
  versao: z.number().int().min(0),
  exportadoEm: z.string(),
  estado: z.unknown(),
  caderno: z.array(z.unknown()),
});

export interface Backup {
  app: 'democratiza';
  versao: number;
  exportadoEm: string;
  estado: Estado;
  caderno: EntradaCaderno[];
}

export function gerarBackup(estado: Estado, caderno: Caderno, exportadoEm: string): Backup {
  return {
    app: 'democratiza',
    versao: VERSAO_ATUAL,
    exportadoEm,
    estado,
    caderno: Object.values(caderno),
  };
}

export function nomeDoArquivo(dia: string): string {
  return `democratiza-backup-${dia}.json`;
}

export interface ResumoBackup {
  conceitos: number;
  cursos: number;
}

export type LeituraBackup =
  | { ok: true; estado: Estado; caderno: Caderno; resumo: ResumoBackup }
  | { ok: false; motivo: string };

/**
 * Valida o texto de um arquivo de backup SEM mexer em nada: quem chama só aplica
 * o resultado se `ok` for verdadeiro. Assim um arquivo inválido nunca destrói o progresso atual.
 */
export function lerBackup(
  texto: string,
  renomeados: Renomeados = {},
  migracoes?: Migracao[],
): LeituraBackup {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'o arquivo não é um JSON válido' };
  }
  const arquivo = arquivoSchema.safeParse(bruto);
  if (!arquivo.success) return { ok: false, motivo: 'o arquivo não é um backup do Democratiza' };
  if (arquivo.data.versao > VERSAO_ATUAL) {
    return { ok: false, motivo: 'o backup foi criado por uma versão mais nova do Democratiza' };
  }

  const estado = lerEstado(arquivo.data.estado, renomeados, migracoes);
  if (!estado.ok) return { ok: false, motivo: estado.motivo };

  const entradas: EntradaCaderno[] = [];
  for (const [i, bruta] of arquivo.data.caderno.entries()) {
    const e = entradaCadernoSchema.safeParse(bruta);
    if (!e.success) return { ok: false, motivo: `o conceito ${i + 1} do caderno está inválido` };
    entradas.push(e.data);
  }
  const caderno = aplicarRenomeadosCaderno(
    Object.fromEntries(entradas.map((e) => [e.conceitoId, e])),
    renomeados,
  );

  const cursos = new Set(Object.keys(estado.estado.licoesConcluidas).map((id) => id.split('/')[0]));
  if (estado.estado.cursoAtual) cursos.add(estado.estado.cursoAtual);
  return {
    ok: true,
    estado: estado.estado,
    caderno,
    resumo: { conceitos: Object.keys(caderno).length, cursos: cursos.size },
  };
}

/** Baixa o backup como arquivo .json (só no navegador). */
export function baixarBackup(backup: Backup, dia: string): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeDoArquivo(dia);
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
