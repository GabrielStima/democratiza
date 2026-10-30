import type { ErroConteudo } from './tipos.ts';

/** Formato usado no terminal e na tela: arquivo, depois campo e problema. */
export function formatarErros(erros: ErroConteudo[]): string {
  const porArquivo = new Map<string, ErroConteudo[]>();
  for (const e of erros) porArquivo.set(e.arquivo, [...(porArquivo.get(e.arquivo) ?? []), e]);
  const blocos: string[] = [];
  for (const [arquivo, lista] of porArquivo) {
    const linhas = lista.map((e) => `  ${e.campo ? `${e.campo}: ` : ''}${e.mensagem}`);
    blocos.push(`✖ ${arquivo}\n${linhas.join('\n')}`);
  }
  return blocos.join('\n\n');
}

/** Converte o caminho de um issue do Zod em "pratica[3].conceitos". */
export function caminhoParaTexto(caminho: ReadonlyArray<PropertyKey>): string {
  let saida = '';
  for (const parte of caminho) {
    if (typeof parte === 'number') saida += `[${parte}]`;
    else saida += saida ? `.${String(parte)}` : String(parte);
  }
  return saida;
}
