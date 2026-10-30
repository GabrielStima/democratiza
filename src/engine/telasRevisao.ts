import type { Nivel } from '../content-schema/curso.ts';
import type { Fonte } from '../content-schema/fonte.ts';
import type { Catalogo } from '../content-schema/tipos.ts';
import type { Caderno, EntradaCaderno } from '../storage/estado.ts';
import { enderecoDaLicao } from './telas.ts';
import { partirIdLicao } from './progresso.ts';
import { diasEntre, somarDias } from './relogio.ts';
import { INTERVALOS_DIAS, MAX_SESSAO, conceitosVencidos, selecionarSessao } from './revisao.ts';

/** Nome de cada força (caixa 1 a 5 do Leitner). */
export const ROTULOS_FORCA = ['Fraco', 'Pegando', 'Firme', 'Forte', 'Dominado'] as const;

export function rotuloDaForca(caixa: number): string {
  return ROTULOS_FORCA[Math.min(5, Math.max(1, caixa)) - 1] ?? ROTULOS_FORCA[0];
}

/** "1 dia", "3 dias". */
export function textoDias(n: number): string {
  return n === 1 ? '1 dia' : `${n} dias`;
}

/** "amanhã" ou "em 7 dias": quando um conceito volta. */
export function voltaEm(dias: number): string {
  return dias <= 1 ? 'amanhã' : `em ${dias} dias`;
}

/** Minúsculas e sem acentos, para a busca do caderno. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// ---------------------------------------------------------------- Caderno

export interface ConceitoDoCaderno {
  id: string;
  nome: string;
  definicao: string;
  exemplo: string;
  naoConfunda: string;
  fonte: Fonte;
  caixa: number;
  cursoId: string;
  cursoTitulo: string;
  nivel: Nivel;
  /** Id completo "curso/unidade/licao" da lição em que foi aprendido. */
  licaoId: string;
  licaoTitulo: string;
  licaoDestino: string;
}

function acharLicao(catalogo: Catalogo, idCompleto: string) {
  const p = partirIdLicao(idCompleto);
  const curso = catalogo.cursos.find((c) => c.id === p?.cursoId);
  const licao = curso?.unidades
    .find((u) => u.id === p?.unidadeId)
    ?.licoes.find((l) => l.id === p?.licaoId);
  return p && curso && licao ? { partes: p, curso, licao } : null;
}

/**
 * Os conceitos aprendidos, em ordem alfabética. Conceito que saiu do catálogo
 * (ou cuja lição saiu) não aparece: não há o que mostrar.
 */
export function itensDoCaderno(caderno: Caderno, catalogo: Catalogo): ConceitoDoCaderno[] {
  const itens: ConceitoDoCaderno[] = [];
  for (const entrada of Object.values(caderno)) {
    const conceito = catalogo.conceitos[entrada.conceitoId];
    const onde = acharLicao(catalogo, entrada.licaoId);
    if (!conceito || !onde) continue;
    itens.push({
      id: conceito.id,
      nome: conceito.nome,
      definicao: conceito.definicao,
      exemplo: conceito.exemplo,
      naoConfunda: conceito.naoConfunda,
      fonte: conceito.fonte,
      caixa: entrada.caixa,
      cursoId: onde.curso.id,
      cursoTitulo: onde.curso.titulo,
      nivel: onde.curso.nivel,
      licaoId: entrada.licaoId,
      licaoTitulo: onde.licao.titulo,
      licaoDestino: enderecoDaLicao(
        onde.partes.cursoId,
        onde.partes.unidadeId,
        onde.partes.licaoId,
      ),
    });
  }
  return itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Cursos que têm conceito no caderno, na ordem do catálogo. */
export function cursosDoCaderno(
  itens: ConceitoDoCaderno[],
  catalogo: Catalogo,
): { id: string; titulo: string }[] {
  const presentes = new Set(itens.map((i) => i.cursoId));
  return catalogo.cursos
    .filter((c) => presentes.has(c.id))
    .map((c) => ({ id: c.id, titulo: c.titulo }));
}

/** Busca (sem acento nem maiúscula, no nome e na definição) e filtro por curso, juntos. */
export function filtrarCaderno(
  itens: ConceitoDoCaderno[],
  busca: string,
  cursoId: string | null,
): ConceitoDoCaderno[] {
  const termo = normalizar(busca);
  return itens.filter(
    (i) =>
      (cursoId === null || i.cursoId === cursoId) &&
      (termo === '' || normalizar(`${i.nome} ${i.definicao}`).includes(termo)),
  );
}

// ---------------------------------------------------------------- Revisar

const DIAS_DA_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

function diaDaSemana(dia: string): string {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  return DIAS_DA_SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()] ?? '';
}

export interface ProximaRevisao {
  rotulo: string;
  quantidade: number;
}

/**
 * "Amanhã", cada dia da semana até o sexto dia, "Semana que vem" (7 a 13 dias)
 * e "Mais adiante". Só aparecem os grupos que têm conceito.
 */
export function proximasRevisoesAgrupadas(caderno: Caderno, hoje: string): ProximaRevisao[] {
  const porDia = new Map<number, number>();
  for (const e of Object.values(caderno)) {
    const d = diasEntre(hoje, e.proximaRevisao);
    if (d >= 1) porDia.set(d, (porDia.get(d) ?? 0) + 1);
  }
  const grupos: ProximaRevisao[] = [];
  const dias = [...porDia.keys()].sort((a, b) => a - b);
  let semanaQueVem = 0;
  let adiante = 0;
  for (const d of dias) {
    const q = porDia.get(d) ?? 0;
    if (d === 1) grupos.push({ rotulo: 'Amanhã', quantidade: q });
    else if (d <= 6) grupos.push({ rotulo: diaDaSemana(somarDias(hoje, d)), quantidade: q });
    else if (d <= 13) semanaQueVem += q;
    else adiante += q;
  }
  if (semanaQueVem > 0) grupos.push({ rotulo: 'Semana que vem', quantidade: semanaQueVem });
  if (adiante > 0) grupos.push({ rotulo: 'Mais adiante', quantidade: adiante });
  return grupos;
}

export interface ItemVencido {
  conceitoId: string;
  nome: string;
  cursoTitulo: string;
  /** "hoje", "há 1 dia", "há 3 dias". */
  vistoHa: string;
  caixa: number;
  forca: string;
}

export interface CursoDeTreino {
  id: string;
  titulo: string;
  quantidade: number;
}

export interface DadosRevisao {
  /** Todos os conceitos vencidos: o número do menu lateral e da Home. */
  total: number;
  /** Os que entram na sessão de hoje (no máximo 10). */
  sessao: ItemVencido[];
  cursosVindos: number;
  minutos: number;
  proximas: ProximaRevisao[];
  /** Em quantos dias vence o próximo conceito; nulo se não há nenhum a vencer. */
  proximoEmDias: number | null;
  /** A pessoa já tem conceitos no caderno? */
  temCaderno: boolean;
  cursosDeTreino: CursoDeTreino[];
}

function vistoHa(e: EntradaCaderno, hoje: string): string {
  const d = Math.max(0, diasEntre(e.ultimaRevisao ?? e.aprendidoEm, hoje));
  return d === 0 ? 'hoje' : `há ${textoDias(d)}`;
}

/** Cerca de 40 segundos por conceito. */
export function minutosDaRevisao(conceitos: number): number {
  return Math.max(1, Math.ceil((conceitos * 40) / 60));
}

/** Tudo o que a tela Revisar mostra, já calculado. */
export function dadosDaRevisao(caderno: Caderno, catalogo: Catalogo, hoje: string): DadosRevisao {
  const itens = itensDoCaderno(caderno, catalogo);
  const porId = new Map(itens.map((i) => [i.id, i]));
  const vencidos = conceitosVencidos(caderno, hoje);
  const sessao = selecionarSessao(caderno, hoje).flatMap<ItemVencido>((e) => {
    const item = porId.get(e.conceitoId);
    return item
      ? [
          {
            conceitoId: e.conceitoId,
            nome: item.nome,
            cursoTitulo: item.cursoTitulo,
            vistoHa: vistoHa(e, hoje),
            caixa: e.caixa,
            forca: rotuloDaForca(e.caixa),
          },
        ]
      : [];
  });
  const cursosVindos = new Set(
    vencidos.flatMap((e) => {
      const item = porId.get(e.conceitoId);
      return item ? [item.cursoId] : [];
    }),
  ).size;
  const futuros = Object.values(caderno)
    .map((e) => diasEntre(hoje, e.proximaRevisao))
    .filter((d) => d >= 1);
  return {
    total: vencidos.length,
    sessao,
    cursosVindos,
    minutos: minutosDaRevisao(sessao.length),
    proximas: proximasRevisoesAgrupadas(caderno, hoje),
    proximoEmDias: futuros.length > 0 ? Math.min(...futuros) : null,
    temCaderno: itens.length > 0,
    cursosDeTreino: cursosDoCaderno(itens, catalogo).map((c) => ({
      ...c,
      quantidade: itens.filter((i) => i.cursoId === c.id).length,
    })),
  };
}

/**
 * Conceitos do treino livre de um curso: os mais fracos primeiro, no máximo 10.
 * Vencidos ou não: é treino, não mexe no calendário.
 */
export function conceitosDoTreino(caderno: Caderno, catalogo: Catalogo, cursoId: string): string[] {
  return itensDoCaderno(caderno, catalogo)
    .filter((i) => i.cursoId === cursoId)
    .map((i) => caderno[i.id])
    .flatMap((e) => (e ? [e] : []))
    .sort(
      (a, b) =>
        a.caixa - b.caixa ||
        a.proximaRevisao.localeCompare(b.proximaRevisao) ||
        a.conceitoId.localeCompare(b.conceitoId),
    )
    .slice(0, MAX_SESSAO)
    .map((e) => e.conceitoId);
}

/** Em quantos dias cada caixa volta: o "Como funciona" da tela Revisar. */
export const PASSOS_DE_FORCA = INTERVALOS_DIAS.map((dias, i) => ({
  caixa: i + 1,
  quando: textoDias(dias),
}));
