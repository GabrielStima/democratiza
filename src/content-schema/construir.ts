import { z } from 'zod';
import { conceitoSchema, type Conceito } from './conceito.ts';
import { cursoSchema, unidadeSchema, type CursoArquivo, type UnidadeArquivo } from './curso.ts';
import { caminhoParaTexto } from './formatar.ts';
import { licaoSchema, type Licao } from './licao.ts';
import type {
  ArquivoEntrada,
  Catalogo,
  ConceitoCatalogo,
  CursoCatalogo,
  ErroConteudo,
  ItemBibliografia,
  LicaoCatalogo,
  ResultadoConteudo,
  UnidadeCatalogo,
} from './tipos.ts';
import { VISUAIS_CONHECIDOS } from './visuais.ts';

z.config(z.locales.pt());

export interface OpcoesConstrucao {
  /** Inclui lições `rascunho` no resultado (npm run dev e prévias). */
  mostrarRascunhos: boolean;
  /** Nomes de visuais válidos; por padrão, a lista oficial. */
  visuais?: readonly string[];
}

const NOME = /^(\d+)-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const PREFIXO = 'content/';

interface Item<T> {
  arquivo: string;
  ordem: number;
  id: string;
  dados: T;
}
interface UnidadeBruta {
  ordem: number;
  id: string;
  dir: string;
  info?: Item<UnidadeArquivo>;
  licoes: Item<Licao>[];
}
interface CursoBruto {
  ordem: number;
  id: string;
  dir: string;
  info?: Item<CursoArquivo>;
  unidades: Map<string, UnidadeBruta>;
}

function ordemEId(nome: string): { ordem: number; id: string } | null {
  const m = NOME.exec(nome);
  return m ? { ordem: Number(m[1]), id: m[2] as string } : null;
}

/** Valida todo o conteúdo e monta catálogo, lições e bibliografia. Não toca no disco. */
export function construirConteudo(
  entrada: ArquivoEntrada[],
  opcoes: OpcoesConstrucao,
): ResultadoConteudo & { erros: ErroConteudo[] } {
  const erros: ErroConteudo[] = [];
  const erro = (arquivo: string, campo: string, mensagem: string) =>
    erros.push({
      arquivo: arquivo.startsWith(PREFIXO) ? arquivo : PREFIXO + arquivo,
      campo,
      mensagem,
    });

  function analisar<S extends z.ZodType>(schema: S, arq: ArquivoEntrada): z.infer<S> | null {
    const r = schema.safeParse(arq.dados);
    if (r.success) return r.data;
    for (const i of r.error.issues) {
      let campo = caminhoParaTexto(i.path);
      let msg = i.message;
      if (i.code === 'unrecognized_keys') {
        const chaves = (i as unknown as { keys: string[] }).keys;
        campo = [campo, chaves.join(', ')].filter(Boolean).join('.');
        msg = 'campo desconhecido (confira se o nome está certo)';
      }
      erro(arq.caminho, campo, msg);
    }
    return null;
  }

  const conceitos = new Map<string, Item<Conceito>>();
  const cursos = new Map<string, CursoBruto>();
  let renomeados: Record<string, string> = {};

  // 1. Varredura: classifica cada arquivo pelo caminho.
  for (const arq of entrada) {
    if (arq.erroLeitura !== undefined) {
      erro(arq.caminho, '', arq.erroLeitura);
      continue;
    }
    const partes = arq.caminho.split('/');
    const ultimo = partes[partes.length - 1] ?? '';

    if (arq.caminho === 'renomeados.json') {
      const r = analisar(z.record(z.string(), z.string()), arq);
      if (r) renomeados = r;
      continue;
    }

    if (partes[0] === 'conceitos' && partes.length === 2) {
      const id = ultimo.replace(/\.json$/, '');
      const dados = analisar(conceitoSchema, arq);
      if (!dados) continue;
      if (dados.id !== id) {
        erro(
          arq.caminho,
          'id',
          `o id "${dados.id}" precisa ser igual ao nome do arquivo ("${id}")`,
        );
        continue;
      }
      conceitos.set(id, { arquivo: arq.caminho, ordem: 0, id, dados });
      continue;
    }

    if (partes[0] === 'cursos' && partes.length >= 3 && partes.length <= 4) {
      const c = ordemEId(partes[1] ?? '');
      if (!c) {
        erro(
          arq.caminho,
          '',
          `a pasta do curso precisa se chamar NN-nome (ex.: 01-comece-por-aqui)`,
        );
        continue;
      }
      const curso: CursoBruto = cursos.get(c.id) ?? {
        ordem: c.ordem,
        id: c.id,
        dir: partes[1] as string,
        unidades: new Map(),
      };
      if (curso.dir !== partes[1]) {
        erro(
          arq.caminho,
          '',
          `já existe outro curso com o id "${c.id}" (${PREFIXO}cursos/${curso.dir})`,
        );
        continue;
      }
      cursos.set(c.id, curso);

      if (partes.length === 3 && ultimo === 'curso.json') {
        const dados = analisar(cursoSchema, arq);
        if (dados) curso.info = { arquivo: arq.caminho, ordem: c.ordem, id: c.id, dados };
        continue;
      }

      if (partes.length === 4) {
        const u = ordemEId(partes[2] ?? '');
        if (!u) {
          erro(
            arq.caminho,
            '',
            `a pasta da unidade precisa se chamar NN-nome (ex.: 01-o-que-e-democracia)`,
          );
          continue;
        }
        const unidade: UnidadeBruta = curso.unidades.get(u.id) ?? {
          ordem: u.ordem,
          id: u.id,
          dir: partes[2] as string,
          licoes: [],
        };
        if (unidade.dir !== partes[2]) {
          erro(arq.caminho, '', `já existe outra unidade com o id "${u.id}" neste curso`);
          continue;
        }
        curso.unidades.set(u.id, unidade);

        if (ultimo === 'unidade.json') {
          const dados = analisar(unidadeSchema, arq);
          if (dados) unidade.info = { arquivo: arq.caminho, ordem: u.ordem, id: u.id, dados };
          continue;
        }
        const l = ordemEId(ultimo.replace(/\.json$/, ''));
        if (!ultimo.endsWith('.json') || !l) {
          erro(
            arq.caminho,
            '',
            `o arquivo da lição precisa se chamar NN-nome.json (ex.: 01-o-poder-vem-do-povo.json)`,
          );
          continue;
        }
        if (unidade.licoes.some((x) => x.id === l.id)) {
          erro(arq.caminho, '', `já existe outra lição com o id "${l.id}" nesta unidade`);
          continue;
        }
        const dados = analisar(licaoSchema, arq);
        if (dados) unidade.licoes.push({ arquivo: arq.caminho, ordem: l.ordem, id: l.id, dados });
        continue;
      }
    }

    erro(arq.caminho, '', 'arquivo fora do lugar esperado em content/');
  }

  // Pastas sem o arquivo de descrição.
  for (const curso of cursos.values()) {
    if (!curso.info) erro(`cursos/${curso.dir}`, '', 'falta o arquivo curso.json');
    for (const u of curso.unidades.values()) {
      if (!u.info) erro(`cursos/${curso.dir}/${u.dir}`, '', 'falta o arquivo unidade.json');
    }
  }

  const cursosValidos = [...cursos.values()]
    .filter((c) => c.info)
    .sort((a, b) => a.ordem - b.ordem);
  for (const c of cursosValidos) {
    c.unidades = new Map(
      [...c.unidades.entries()].filter(([, u]) => u.info).sort(([, a], [, b]) => a.ordem - b.ordem),
    );
    for (const u of c.unidades.values()) u.licoes.sort((a, b) => a.ordem - b.ordem);
  }

  // Ordens repetidas deixam a sequência ambígua.
  const repetidas = (itens: { ordem: number }[]) =>
    itens.length !== new Set(itens.map((i) => i.ordem)).size;
  if (repetidas(cursosValidos)) erro('cursos', '', 'dois cursos usam o mesmo número de ordem');
  for (const c of cursosValidos) {
    const unidades = [...c.unidades.values()];
    if (repetidas(unidades))
      erro(`cursos/${c.dir}`, '', 'duas unidades usam o mesmo número de ordem');
    for (const u of unidades) {
      if (repetidas(u.licoes))
        erro(`cursos/${c.dir}/${u.dir}`, '', 'duas lições usam o mesmo número de ordem');
    }
  }

  // 2. Referências a conceitos que existem.
  const existe = (id: string) => conceitos.has(id);
  const naoExiste = (arquivo: string, campo: string, id: string) =>
    erro(arquivo, campo, `"${id}" não existe em content/conceitos/`);

  for (const c of conceitos.values()) {
    c.dados.requer.forEach((id, i) => existe(id) || naoExiste(c.arquivo, `requer[${i}]`, id));
  }
  for (const curso of cursosValidos) {
    const info = curso.info as Item<CursoArquivo>;
    info.dados.requer_conceitos.forEach(
      (id, i) => existe(id) || naoExiste(info.arquivo, `requer_conceitos[${i}]`, id),
    );
    for (const u of curso.unidades.values()) {
      for (const l of u.licoes) {
        l.dados.ensina.forEach((id, i) => existe(id) || naoExiste(l.arquivo, `ensina[${i}]`, id));
        l.dados.pratica.forEach((ex, i) =>
          ex.conceitos.forEach(
            (id) => existe(id) || naoExiste(l.arquivo, `pratica[${i}].conceitos`, id),
          ),
        );
      }
    }
  }

  // 7. Ciclos no grafo de pré-requisitos.
  const estado = new Map<string, 'visitando' | 'ok'>();
  const ciclo = (id: string, trilha: string[]): string[] | null => {
    if (estado.get(id) === 'ok') return null;
    if (estado.get(id) === 'visitando') return [...trilha.slice(trilha.indexOf(id)), id];
    estado.set(id, 'visitando');
    for (const dep of conceitos.get(id)?.dados.requer ?? []) {
      if (!existe(dep)) continue;
      const achado = ciclo(dep, [...trilha, id]);
      if (achado) return achado;
    }
    estado.set(id, 'ok');
    return null;
  };
  for (const id of conceitos.keys()) {
    const achado = ciclo(id, []);
    if (achado) {
      erro(
        (conceitos.get(id) as Item<Conceito>).arquivo,
        'requer',
        `ciclo de pré-requisitos: ${achado.join(' → ')}`,
      );
      break;
    }
  }

  // 3. Nenhuma lição usa conceito que ainda não foi ensinado antes dela.
  const fechamento = (ids: Iterable<string>): Set<string> => {
    const saida = new Set<string>();
    const pilha = [...ids];
    while (pilha.length) {
      const id = pilha.pop() as string;
      if (saida.has(id) || !existe(id)) continue;
      saida.add(id);
      pilha.push(...(conceitos.get(id)?.dados.requer ?? []));
    }
    return saida;
  };

  for (const curso of cursosValidos) {
    const info = curso.info as Item<CursoArquivo>;
    const ensinados = fechamento(info.dados.requer_conceitos);
    for (const u of curso.unidades.values()) {
      for (const l of u.licoes) {
        const antes = new Set(ensinados);
        l.dados.ensina.forEach((id, i) => {
          if (!existe(id)) return;
          for (const req of conceitos.get(id)?.dados.requer ?? []) {
            if (existe(req) && !antes.has(req)) {
              erro(
                l.arquivo,
                `ensina[${i}]`,
                `"${id}" exige "${req}", que ainda não foi ensinado antes desta lição`,
              );
            }
          }
          antes.add(id);
        });
        l.dados.pratica.forEach((ex, i) => {
          for (const id of ex.conceitos) {
            if (existe(id) && !antes.has(id)) {
              erro(
                l.arquivo,
                `pratica[${i}].conceitos`,
                `"${id}" ainda não foi ensinado antes desta lição`,
              );
            }
          }
        });
        l.dados.ensina.forEach((id) => ensinados.add(id));
      }
    }
  }

  // 6, 8 e texto pendente.
  const visuais = new Set(opcoes.visuais ?? VISUAIS_CONHECIDOS);
  for (const curso of cursosValidos) {
    const nivel = (curso.info as Item<CursoArquivo>).dados.nivel;
    for (const u of curso.unidades.values()) {
      for (const l of u.licoes) {
        l.dados.pratica.forEach((ex, i) => {
          if (ex.tipo === 'correntes' && nivel !== 'modulo') {
            erro(
              l.arquivo,
              `pratica[${i}].tipo`,
              'o tipo "correntes" só pode ser usado em cursos de nível "modulo"',
            );
          }
        });
        if (l.dados.status === 'revisado') {
          l.dados.explicacao?.forEach((card, i) => {
            if (card.visual && !visuais.has(card.visual)) {
              erro(
                l.arquivo,
                `explicacao[${i}].visual`,
                `o esquema "${card.visual}" não existe (lição revisada precisa de um visual pronto)`,
              );
            }
          });
          const bruto = JSON.stringify(l.dados).toLowerCase();
          if (bruto.includes('lorem ipsum') || bruto.includes('a preencher')) {
            erro(
              l.arquivo,
              '',
              'lição revisada ainda tem texto de teste ("Lorem ipsum") ou "A preencher"',
            );
          }
        }
      }
    }
  }

  // 4. Montagem do catálogo (só o que será publicado).
  const incluir = (l: Licao) => l.status === 'revisado' || opcoes.mostrarRascunhos;
  const licoes: Record<string, Licao> = {};
  const catalogoCursos: CursoCatalogo[] = [];
  const ensinadoEm = new Map<string, { curso: string; unidade: string; licao: string }>();
  const usosFonte = new Map<string, { descricao: string; link?: string; licoes: Set<string> }>();

  const registrarFonte = (
    f: { descricao: string; link?: string | undefined },
    chaveLicao: string,
  ) => {
    const chave = f.descricao.replace(/\s+/g, ' ').trim().toLowerCase();
    const atual = usosFonte.get(chave) ?? {
      descricao: f.descricao.trim(),
      licoes: new Set<string>(),
    };
    if (f.link && !atual.link) atual.link = f.link;
    atual.licoes.add(chaveLicao);
    usosFonte.set(chave, atual);
  };

  for (const curso of cursosValidos) {
    const info = curso.info as Item<CursoArquivo>;
    const unidadesCat: UnidadeCatalogo[] = [];
    const ensinaCurso: string[] = [];
    for (const u of curso.unidades.values()) {
      const uInfo = u.info as Item<UnidadeArquivo>;
      const licoesCat: LicaoCatalogo[] = [];
      for (const l of u.licoes) {
        if (!incluir(l.dados)) continue;
        const chave = `${curso.id}/${u.id}/${l.id}`;
        licoes[chave] = l.dados;
        licoesCat.push({
          id: l.id,
          ordem: l.ordem,
          titulo: l.dados.titulo,
          status: l.dados.status,
          tipo: l.dados.tipo === 'desafio' ? 'desafio' : 'normal',
          ensina: l.dados.ensina,
          conceitosPratica: [...new Set(l.dados.pratica.flatMap((e) => e.conceitos))],
          nCards: l.dados.explicacao?.length ?? 0,
          nExercicios: l.dados.pratica.length,
        });
        for (const id of l.dados.ensina) {
          ensinaCurso.push(id);
          if (!ensinadoEm.has(id))
            ensinadoEm.set(id, { curso: curso.id, unidade: u.id, licao: l.id });
          const c = conceitos.get(id);
          if (c) registrarFonte(c.dados.fonte, chave);
        }
        l.dados.explicacao?.forEach((card) => registrarFonte(card.fonte, chave));
        for (const ex of l.dados.pratica) {
          registrarFonte(ex.fonte, chave);
          if (ex.tipo === 'correntes') ex.leituras.forEach((r) => registrarFonte(r.fonte, chave));
        }
      }
      if (licoesCat.length > 0) {
        unidadesCat.push({
          id: u.id,
          ordem: u.ordem,
          titulo: uInfo.dados.titulo,
          descricao: uInfo.dados.descricao,
          licoes: licoesCat,
        });
      }
    }
    if (unidadesCat.length > 0) {
      catalogoCursos.push({
        id: curso.id,
        ordem: curso.ordem,
        titulo: info.dados.titulo,
        nivel: info.dados.nivel,
        descricao: info.dados.descricao,
        cor: info.dados.cor,
        requerConceitos: info.dados.requer_conceitos,
        unidades: unidadesCat,
        ensina: [...new Set(ensinaCurso)],
        libera: [],
      });
    }
  }

  for (const a of catalogoCursos) {
    a.libera = catalogoCursos
      .filter((b) => b.id !== a.id && b.requerConceitos.some((id) => a.ensina.includes(id)))
      .map((b) => b.id);
  }

  // Conceitos que o site precisa conhecer.
  const citados = new Set<string>();
  for (const c of catalogoCursos) {
    c.requerConceitos.forEach((id) => citados.add(id));
    c.ensina.forEach((id) => citados.add(id));
    for (const u of c.unidades)
      for (const l of u.licoes) l.conceitosPratica.forEach((id) => citados.add(id));
  }
  const conceitosCat: Record<string, ConceitoCatalogo> = {};
  for (const id of fechamento(citados)) {
    const c = (conceitos.get(id) as Item<Conceito>).dados;
    const onde = ensinadoEm.get(id);
    conceitosCat[id] = {
      id,
      nome: c.nome,
      definicao: c.definicao,
      exemplo: c.exemplo,
      naoConfunda: c.nao_confunda,
      requer: c.requer,
      fonte: c.fonte,
      ...(onde ? { ensinadoEm: onde } : {}),
    };
  }

  const bibliografia: ItemBibliografia[] = [...usosFonte.values()]
    .map((u) => ({
      descricao: u.descricao,
      ...(u.link ? { link: u.link } : {}),
      usadaEm: u.licoes.size,
    }))
    .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR'));

  const catalogo: Catalogo = {
    cursos: catalogoCursos,
    conceitos: conceitosCat,
    renomeados,
    erros,
    comRascunhos: opcoes.mostrarRascunhos,
  };
  return { catalogo, licoes, bibliografia, erros };
}
