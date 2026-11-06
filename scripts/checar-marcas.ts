/**
 * Procura marcas de terceiros em todo o repositório (LEGALIDADE.md, seção 6).
 *
 *   npm run checar-marcas
 *
 * Lê os termos de `scripts/marcas-vetadas.json`. Falha (código 1) mostrando arquivo e linha.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Ocorrencia {
  arquivo: string;
  linha: number;
  termo: string;
}

const PASTAS_IGNORADAS = new Set(['node_modules', 'dist', '.git', 'coverage', 'test-results']);
const BINARIOS = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip|tgz|gz)$/i;

export function lerTermos(arquivo: string): string[] {
  const dados: unknown = JSON.parse(readFileSync(arquivo, 'utf8'));
  const termos =
    typeof dados === 'object' && dados !== null && 'termos' in dados ? dados.termos : null;
  if (!Array.isArray(termos) || !termos.every((t): t is string => typeof t === 'string' && !!t)) {
    throw new Error(`${arquivo}: "termos" deve ser uma lista de textos não vazios.`);
  }
  return termos;
}

/**
 * Arquivos que o git conhece (versionados e novos, sem os ignorados pelo `.gitignore`).
 * Devolve null fora de um repositório git.
 */
export function arquivosDoGit(raiz: string): string[] | null {
  try {
    const saida = execFileSync(
      'git',
      ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return saida
      .split('\0')
      .filter(Boolean)
      .map((a) => join(raiz, a));
  } catch {
    return null;
  }
}

/** Percorre `raiz` (menos pastas ignoradas e `ignorar`) e devolve cada linha que contém um termo. */
export function procurar(
  raiz: string,
  termos: string[],
  ignorar: string[] = [],
  /** Se vier, só estes arquivos são lidos (em vez de percorrer as pastas). */
  arquivos?: string[],
): Ocorrencia[] {
  const minusculos = termos.map((t) => t.toLowerCase());
  const fora = new Set(ignorar);
  const achados: Ocorrencia[] = [];
  const ler = (completo: string, nome: string) => {
    if (BINARIOS.test(nome) || fora.has(completo)) return;
    let texto: string;
    try {
      texto = readFileSync(completo, 'utf8');
    } catch {
      return;
    }
    if (texto.includes('\u0000')) return;
    texto.split('\n').forEach((linha, i) => {
      const baixa = linha.toLowerCase();
      for (const termo of minusculos) {
        if (baixa.includes(termo)) {
          achados.push({ arquivo: relative(raiz, completo), linha: i + 1, termo });
        }
      }
    });
  };
  const andar = (dir: string) => {
    for (const nome of readdirSync(dir).sort()) {
      if (PASTAS_IGNORADAS.has(nome) || nome.startsWith('._') || nome === '.DS_Store') continue;
      const completo = join(dir, nome);
      if (fora.has(completo)) continue;
      if (statSync(completo).isDirectory()) {
        andar(completo);
        continue;
      }
      ler(completo, nome);
    }
  };
  if (arquivos) {
    for (const a of arquivos.toSorted()) {
      if (!a.split(/[\\/]/).some((p) => PASTAS_IGNORADAS.has(p) || p.startsWith('._'))) {
        ler(a, a);
      }
    }
  } else {
    andar(raiz);
  }
  return achados;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const raiz = process.cwd();
  const arquivoTermos = join(raiz, 'scripts', 'marcas-vetadas.json');
  const achados = procurar(
    raiz,
    lerTermos(arquivoTermos),
    [arquivoTermos],
    arquivosDoGit(raiz) ?? undefined,
  );
  if (achados.length > 0) {
    console.error('✖ Marca de terceiros encontrada (veja LEGALIDADE.md, seção 6):\n');
    for (const a of achados) console.error(`  ${a.arquivo}:${a.linha}  (${a.termo})`);
    process.exit(1);
  }
  console.log('✔ Nenhuma marca de terceiros encontrada.');
}
