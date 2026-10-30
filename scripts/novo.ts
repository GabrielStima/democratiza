/**
 * Cria o esqueleto válido (sempre `rascunho`) de um curso, unidade, lição ou conceito.
 *
 *   npm run novo -- curso <id> [--nivel introducao|aprofundamento|modulo] [--titulo "Título"]
 *   npm run novo -- unidade <curso> <id> [--titulo "Título"]
 *   npm run novo -- licao <curso>/<unidade> <id> [--conceito id1,id2] [--titulo "Título"]
 *   npm run novo -- conceito <id> [--nome "Nome"]
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PENDENTE = 'A preencher.';
const FONTE = { descricao: 'A preencher: fonte específica (obra e página, ou lei e artigo)' };

function ler(args: string[], nome: string): string | undefined {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function posicionais(args: string[]): string[] {
  const saida: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i]?.startsWith('--')) i++;
    else saida.push(args[i] as string);
  }
  return saida;
}

function validarId(id: string | undefined, o: string): string {
  if (!id || !ID.test(id)) {
    throw new Error(
      `${o} precisa estar em minúsculas, sem acento, com hífens (ex.: o-poder-vem-do-povo)`,
    );
  }
  return id;
}

function tituloDe(id: string): string {
  const t = id.replace(/-/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Acha a pasta (ou arquivo .json) com um id, ignorando o número do começo. */
function achar(dir: string, id: string, arquivo = false): string | undefined {
  if (!existsSync(dir)) return undefined;
  return readdirSync(dir).find((n) => {
    const m = /^(\d+)-(.+?)(\.json)?$/.exec(n);
    return m?.[2] === id && Boolean(m[3]) === arquivo;
  });
}

function proximoNumero(dir: string): string {
  const nums = existsSync(dir)
    ? readdirSync(dir).flatMap((n) => {
        const m = /^(\d+)-/.exec(n);
        return m ? [Number(m[1])] : [];
      })
    : [];
  return String(Math.max(0, ...nums) + 1).padStart(2, '0');
}

function escrever(raiz: string, caminho: string, dados: unknown, criados: string[]) {
  const completo = join(raiz, caminho);
  mkdirSync(join(completo, '..'), { recursive: true });
  writeFileSync(completo, JSON.stringify(dados, null, 2) + '\n', 'utf8');
  criados.push(`content/${caminho}`);
}

const cartaoChecagem = {
  tipo: 'multipla_escolha',
  pergunta: PENDENTE,
  opcoes: [PENDENTE, PENDENTE, PENDENTE],
  correta: 0,
  reexplicacao: PENDENTE,
};

function conceito(raiz: string, id: string, nome: string, criados: string[]) {
  escrever(
    raiz,
    `conceitos/${id}.json`,
    {
      id,
      nome,
      definicao: PENDENTE,
      exemplo: PENDENTE,
      nao_confunda: PENDENTE,
      requer: [],
      fonte: FONTE,
    },
    criados,
  );
}

/** Executa um comando e devolve os arquivos criados (caminhos a partir da raiz do projeto). */
export function criar(raizContent: string, args: string[]): string[] {
  const [comando, ...resto] = posicionais(args);
  const pos = resto;
  const criados: string[] = [];

  if (comando === 'conceito') {
    const id = validarId(pos[0], 'o id do conceito');
    if (existsSync(join(raizContent, 'conceitos', `${id}.json`)))
      throw new Error(`o conceito "${id}" já existe`);
    conceito(raizContent, id, ler(args, 'nome') ?? tituloDe(id), criados);
    return criados;
  }

  if (comando === 'curso') {
    const id = validarId(pos[0], 'o id do curso');
    const pasta = join(raizContent, 'cursos');
    if (achar(pasta, id)) throw new Error(`o curso "${id}" já existe`);
    const nivel = ler(args, 'nivel') ?? 'introducao';
    if (!['introducao', 'aprofundamento', 'modulo'].includes(nivel)) {
      throw new Error('--nivel precisa ser introducao, aprofundamento ou modulo');
    }
    const cor = { introducao: 'verde', aprofundamento: 'azul', modulo: 'roxo' }[nivel];
    escrever(
      raizContent,
      `cursos/${proximoNumero(pasta)}-${id}/curso.json`,
      {
        titulo: ler(args, 'titulo') ?? tituloDe(id),
        nivel,
        descricao: PENDENTE,
        cor,
        requer_conceitos: [],
      },
      criados,
    );
    return criados;
  }

  if (comando === 'unidade') {
    const cursoId = validarId(pos[0], 'o id do curso');
    const id = validarId(pos[1], 'o id da unidade');
    const cursoDir = achar(join(raizContent, 'cursos'), cursoId);
    if (!cursoDir) throw new Error(`o curso "${cursoId}" não existe`);
    const pasta = join(raizContent, 'cursos', cursoDir);
    if (achar(pasta, id)) throw new Error(`a unidade "${id}" já existe neste curso`);
    escrever(
      raizContent,
      `cursos/${cursoDir}/${proximoNumero(pasta)}-${id}/unidade.json`,
      { titulo: ler(args, 'titulo') ?? tituloDe(id), descricao: PENDENTE },
      criados,
    );
    return criados;
  }

  if (comando === 'licao') {
    const [cursoId, unidadeId] = (pos[0] ?? '').split('/');
    if (!cursoId || !unidadeId)
      throw new Error('informe <curso>/<unidade>, ex.: comece-por-aqui/o-que-e-democracia');
    const id = validarId(pos[1], 'o id da lição');
    const cursoDir = achar(join(raizContent, 'cursos'), cursoId);
    if (!cursoDir) throw new Error(`o curso "${cursoId}" não existe`);
    const unidadeDir = achar(join(raizContent, 'cursos', cursoDir), unidadeId);
    if (!unidadeDir) throw new Error(`a unidade "${unidadeId}" não existe em "${cursoId}"`);
    const pasta = join(raizContent, 'cursos', cursoDir, unidadeDir);
    if (achar(pasta, id, true)) throw new Error(`a lição "${id}" já existe nesta unidade`);

    let conceitos = (ler(args, 'conceito') ?? '').split(',').filter(Boolean);
    if (conceitos.length === 0) {
      conceitos = [id];
      if (!existsSync(join(raizContent, 'conceitos', `${id}.json`))) {
        conceito(raizContent, id, tituloDe(id), criados);
      }
    }
    conceitos.forEach((c) => validarId(c, 'o id do conceito'));

    escrever(
      raizContent,
      `cursos/${cursoDir}/${unidadeDir}/${proximoNumero(pasta)}-${id}.json`,
      {
        titulo: ler(args, 'titulo') ?? tituloDe(id),
        status: 'rascunho',
        ensina: conceitos,
        situacao: { texto: PENDENTE, palpites: [PENDENTE, PENDENTE, PENDENTE] },
        explicacao: [
          {
            titulo: PENDENTE,
            texto: PENDENTE,
            glossario: {},
            fonte: FONTE,
            checagem: cartaoChecagem,
          },
        ],
        pratica: [
          {
            tipo: 'multipla_escolha',
            conceitos,
            pergunta: PENDENTE,
            opcoes: [PENDENTE, PENDENTE, PENDENTE],
            correta: 0,
            explicacao: PENDENTE,
            fonte: FONTE,
          },
        ],
      },
      criados,
    );
    return criados;
  }

  throw new Error(
    'use: novo curso | unidade | licao | conceito (veja o cabeçalho de scripts/novo.ts)',
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const criados = criar(join(process.cwd(), 'content'), process.argv.slice(2));
    for (const c of criados) console.log(`✔ ${c}`);
    console.log(
      '\nCriado como rascunho. Preencha os textos e as fontes; rode `npm run dev` para ver.',
    );
  } catch (e) {
    console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
