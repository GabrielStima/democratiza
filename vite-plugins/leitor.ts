import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ArquivoEntrada } from '../src/content-schema/tipos.ts';

/** Lê todos os .json de uma pasta (recursivamente), ignorando lixo do macOS (`._*`, `.DS_Store`). */
export function lerPasta(raiz: string): ArquivoEntrada[] {
  const saida: ArquivoEntrada[] = [];
  const andar = (dir: string, prefixo: string) => {
    let nomes: string[];
    try {
      nomes = readdirSync(dir).sort();
    } catch {
      return;
    }
    for (const nome of nomes) {
      if (nome.startsWith('._') || nome === '.DS_Store' || nome.startsWith('.')) continue;
      const completo = join(dir, nome);
      const caminho = prefixo ? `${prefixo}/${nome}` : nome;
      if (statSync(completo).isDirectory()) {
        andar(completo, caminho);
      } else if (nome.endsWith('.json')) {
        try {
          saida.push({ caminho, dados: JSON.parse(readFileSync(completo, 'utf8')) });
        } catch (e) {
          saida.push({
            caminho,
            erroLeitura: `JSON inválido: ${e instanceof Error ? e.message : String(e)}`,
          });
        }
      }
    }
  };
  andar(raiz, '');
  return saida;
}
