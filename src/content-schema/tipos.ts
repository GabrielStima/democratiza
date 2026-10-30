import type { Nivel } from './curso.ts';
import type { Fonte } from './fonte.ts';
import type { Licao } from './licao.ts';

export interface ErroConteudo {
  /** Caminho relativo à raiz do projeto, ex.: content/cursos/01-x/curso.json */
  arquivo: string;
  /** Campo com problema, ex.: pratica[3].conceitos. Vazio quando o problema é do arquivo. */
  campo: string;
  mensagem: string;
}

export interface ArquivoEntrada {
  /** Caminho relativo a content/, com barras normais: cursos/01-x/curso.json */
  caminho: string;
  /** Conteúdo já lido como JSON. Ausente quando o JSON é inválido. */
  dados?: unknown;
  /** Mensagem de erro de leitura/JSON, quando houver. */
  erroLeitura?: string;
}

export interface LicaoCatalogo {
  id: string;
  ordem: number;
  titulo: string;
  status: 'rascunho' | 'revisado';
  tipo: 'normal' | 'desafio';
  ensina: string[];
  /** Conceitos praticados (usado pelo desafio e pela revisão). */
  conceitosPratica: string[];
  nCards: number;
  nExercicios: number;
}

export interface UnidadeCatalogo {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  licoes: LicaoCatalogo[];
}

export interface CursoCatalogo {
  id: string;
  ordem: number;
  titulo: string;
  nivel: Nivel;
  descricao: string;
  cor: string;
  requerConceitos: string[];
  unidades: UnidadeCatalogo[];
  /** Conceitos que as lições deste curso ensinam. */
  ensina: string[];
  /** Ids dos outros cursos que usam algum conceito deste como pré-requisito. */
  libera: string[];
}

export interface ConceitoCatalogo {
  id: string;
  nome: string;
  definicao: string;
  exemplo: string;
  naoConfunda: string;
  requer: string[];
  fonte: Fonte;
  /** Onde o conceito é ensinado; ausente se nenhuma lição (publicada) o ensina. */
  ensinadoEm?: { curso: string; unidade: string; licao: string };
}

export interface Catalogo {
  cursos: CursoCatalogo[];
  conceitos: Record<string, ConceitoCatalogo>;
  /** { idAntigo: idNovo } vindo de content/renomeados.json */
  renomeados: Record<string, string>;
  /** Erros de validação (só em `npm run dev`; no build, qualquer erro para tudo). */
  erros: ErroConteudo[];
  /** Se este catálogo inclui lições rascunho. */
  comRascunhos: boolean;
}

export interface ItemBibliografia {
  descricao: string;
  link?: string;
  /** Em quantas lições a fonte aparece. */
  usadaEm: number;
}

export interface ResultadoConteudo {
  catalogo: Catalogo;
  /** Lições completas, chave "curso/unidade/licao". */
  licoes: Record<string, Licao>;
  bibliografia: ItemBibliografia[];
}
