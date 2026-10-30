import { signal } from '@preact/signals';
import { catalogo as catalogoDoSite } from '../conteudo/index.ts';
import type { Catalogo } from '../content-schema/tipos.ts';
import { hoje, agora } from '../engine/relogio.ts';
import {
  concluirLicao,
  concluirRevisao,
  type ConclusaoLicao,
  type ConclusaoRevisao,
  type ResultadoLicao,
} from '../engine/sessao.ts';
import type { ResultadoConceito } from '../engine/revisao.ts';
import {
  armazemIndexedDb,
  diferencas,
  paraCaderno,
  type ArmazemCaderno,
} from '../storage/caderno.ts';
import { estadoInicial, type Caderno, type Estado, type MetaDiaria } from '../storage/estado.ts';
import { baixarBackup, gerarBackup, lerBackup, type LeituraBackup } from '../storage/exportar.ts';
import { aplicarRenomeadosCaderno, type Renomeados } from '../storage/migracoes.ts';
import {
  apagarEstado,
  armazemLocal,
  armazemTextoMemoria,
  carregarEstado,
  pedirPersistencia,
  salvarEstado,
  type ArmazemTexto,
} from '../storage/repositorio.ts';

/** Quem chega sem nada salvo é visitante: o estado é nulo até a pessoa escolher a meta. */
export const estado = signal<Estado | null>(null);
/** Conceitos aprendidos, por id. Vem do IndexedDB. */
export const caderno = signal<Caderno>({});
/** Falso até o caderno terminar de carregar. */
export const carregado = signal(false);
/** Falso quando o navegador não deixa guardar (aba privada): o progresso some ao fechar. */
export const persistente = signal(true);
/** O progresso salvo estava quebrado; uma cópia ficou guardada no navegador. */
export const progressoCorrompido = signal(false);

let texto: ArmazemTexto = armazemTextoMemoria();
let armazemDoCaderno: ArmazemCaderno | null = null;
let renomeados: Renomeados = {};

export interface OpcoesIniciar {
  texto?: ArmazemTexto;
  caderno?: ArmazemCaderno;
  renomeados?: Renomeados;
}

/** Carrega o progresso salvo. Chamar uma vez antes de mostrar o app. */
export async function iniciarStores(opcoes: OpcoesIniciar = {}): Promise<void> {
  carregado.value = false;
  renomeados = opcoes.renomeados ?? catalogoDoSite.renomeados;
  if (opcoes.texto) {
    texto = opcoes.texto;
    persistente.value = true;
  } else {
    const local = armazemLocal();
    texto = local.armazem;
    persistente.value = local.persistente;
  }
  armazemDoCaderno = opcoes.caderno ?? armazemIndexedDb();

  const carga = carregarEstado(texto, renomeados);
  estado.value = carga.estado;
  progressoCorrompido.value = carga.corrompido;
  try {
    const lido = paraCaderno(await armazemDoCaderno.carregar());
    const migrado = aplicarRenomeadosCaderno(lido, renomeados);
    caderno.value = lido;
    if (migrado !== lido) definirCaderno(migrado);
  } catch {
    caderno.value = {};
    persistente.value = false;
  }
  carregado.value = true;
}

function armazemCaderno(): ArmazemCaderno {
  return (armazemDoCaderno ??= armazemIndexedDb());
}

/** Troca o estado e guarda. Nulo volta ao visitante. */
export function definirEstado(novo: Estado | null): void {
  estado.value = novo;
  if (novo === null) apagarEstado(texto);
  else if (!salvarEstado(texto, novo)) persistente.value = false;
}

/** Troca o caderno e grava só o que mudou. */
export function definirCaderno(novo: Caderno): void {
  const { salvar, remover } = diferencas(caderno.value, novo);
  caderno.value = novo;
  const a = armazemCaderno();
  void (async () => {
    try {
      if (remover.length > 0) await a.remover(remover);
      if (salvar.length > 0) await a.salvar(salvar);
    } catch {
      persistente.value = false;
    }
  })();
}

/** A pessoa escolheu a meta diária: começa o progresso. */
export function comecarProgresso(meta: MetaDiaria): void {
  definirEstado(estadoInicial(meta, hoje()));
}

export function mudarMeta(meta: MetaDiaria): void {
  const e = estado.value;
  if (e) definirEstado({ ...e, config: { ...e.config, metaDiaria: meta } });
}

function estadoOuNovo(): Estado {
  return estado.value ?? estadoInicial(50, hoje());
}

/** Guarda onde a pessoa parou na lição (null limpa). */
export function definirLicaoEmAndamento(info: Estado['licaoEmAndamento']): void {
  definirEstado({ ...estadoOuNovo(), licaoEmAndamento: info });
}

/** Fecha uma lição: XP, ofensiva, caderno e desbloqueios. */
export function registrarConclusaoLicao(
  resultado: ResultadoLicao,
  catalogo: Catalogo = catalogoDoSite,
): ConclusaoLicao {
  const atual = estadoOuNovo();
  const primeira = Object.keys(atual.licoesConcluidas).length === 0;
  const c = concluirLicao(atual, caderno.value, catalogo, resultado, hoje());
  definirEstado(c.estado);
  definirCaderno(c.caderno);
  if (primeira) void pedirPersistencia();
  return c;
}

/** Fecha uma sessão de revisão (ou de treino livre, que não muda nada). */
export function registrarConclusaoRevisao(
  resultados: ResultadoConceito[],
  xpBruto: number,
  modo: 'revisao' | 'treino' = 'revisao',
): ConclusaoRevisao {
  const c = concluirRevisao(estadoOuNovo(), caderno.value, resultados, xpBruto, hoje(), modo);
  if (modo === 'revisao') {
    definirEstado(c.estado);
    definirCaderno(c.caderno);
  }
  return c;
}

/** Apaga todo o progresso e volta ao visitante. */
export async function apagarProgresso(): Promise<void> {
  definirEstado(null);
  caderno.value = {};
  try {
    await armazemCaderno().limpar();
  } catch {
    persistente.value = false;
  }
}

/** Salva o backup como arquivo .json. */
export function salvarBackup(): void {
  const e = estado.value;
  if (!e) return;
  baixarBackup(gerarBackup(e, caderno.value, agora().toISOString()), hoje());
}

/** Valida o texto de um backup sem mexer em nada (para mostrar o resumo antes de confirmar). */
export function conferirBackup(conteudo: string): LeituraBackup {
  return lerBackup(conteudo, renomeados);
}

/** Substitui o progresso atual pelo do backup. Se o arquivo for inválido, nada muda. */
export async function substituirPorBackup(conteudo: string): Promise<LeituraBackup> {
  const leitura = lerBackup(conteudo, renomeados);
  if (!leitura.ok) return leitura;
  definirEstado(leitura.estado);
  try {
    await armazemCaderno().limpar();
    caderno.value = {};
  } catch {
    persistente.value = false;
  }
  definirCaderno(leitura.caderno);
  return leitura;
}
