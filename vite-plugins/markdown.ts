/**
 * Conversor mínimo de Markdown para HTML, só com o que os textos legais usam:
 * cabeçalho no começo (`---`), `##`/`###`, parágrafos, listas com `-`, **negrito**, `código` e [links](url).
 * Todo texto é escapado; nada de HTML cru passa.
 */

export interface DocumentoLegal {
  titulo: string;
  resumo: string;
  /** Data no formato AAAA-MM-DD. */
  atualizadoEm: string;
  html: string;
}

const escapar = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function identificador(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function emLinha(texto: string): string {
  const partes = escapar(texto);
  return partes
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, rotulo: string, destino: string) => {
      const externo = /^https?:\/\//.test(destino);
      const permitido = externo || destino.startsWith('/');
      if (!permitido) return rotulo;
      return externo
        ? `<a href="${destino}" target="_blank" rel="noopener noreferrer">${rotulo}</a>`
        : `<a href="${destino}">${rotulo}</a>`;
    });
}

export function blocosParaHtml(corpo: string): string {
  const saida: string[] = [];
  let paragrafo: string[] = [];
  let lista: string[] = [];
  const fecharParagrafo = () => {
    if (paragrafo.length) saida.push(`<p>${emLinha(paragrafo.join(' '))}</p>`);
    paragrafo = [];
  };
  const fecharLista = () => {
    if (lista.length) saida.push(`<ul>${lista.map((i) => `<li>${emLinha(i)}</li>`).join('')}</ul>`);
    lista = [];
  };
  for (const linha of corpo.split('\n')) {
    const t = linha.trim();
    const cab = /^(##|###)\s+(.+)$/.exec(t);
    if (cab) {
      fecharParagrafo();
      fecharLista();
      const nivel = cab[1] === '##' ? 2 : 3;
      const texto = cab[2] ?? '';
      saida.push(`<h${nivel} id="${identificador(texto)}">${emLinha(texto)}</h${nivel}>`);
    } else if (t.startsWith('- ')) {
      fecharParagrafo();
      lista.push(t.slice(2));
    } else if (t === '') {
      fecharParagrafo();
      fecharLista();
    } else {
      fecharLista();
      paragrafo.push(t);
    }
  }
  fecharParagrafo();
  fecharLista();
  return saida.join('\n');
}

/** Lê um arquivo `.md` com cabeçalho (titulo, resumo, atualizado). Lança erro com o motivo se faltar algo. */
export function lerDocumentoLegal(nome: string, texto: string): DocumentoLegal {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(texto.replace(/\r\n/g, '\n'));
  if (!m) throw new Error(`${nome}: falta o cabeçalho entre "---" no começo do arquivo.`);
  const campos: Record<string, string> = {};
  for (const linha of (m[1] ?? '').split('\n')) {
    const i = linha.indexOf(':');
    if (i > 0) campos[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
  }
  for (const c of ['titulo', 'resumo', 'atualizado']) {
    if (!campos[c]) throw new Error(`${nome}: falta o campo "${c}" no cabeçalho.`);
  }
  const data = campos.atualizado ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error(`${nome}: "atualizado" deve estar no formato AAAA-MM-DD (achei "${data}").`);
  }
  return {
    titulo: campos.titulo ?? '',
    resumo: campos.resumo ?? '',
    atualizadoEm: data,
    html: blocosParaHtml(m[2] ?? ''),
  };
}
