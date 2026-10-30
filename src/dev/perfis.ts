import type { Catalogo, CursoCatalogo } from '../content-schema/tipos.ts';
import { registrarDiaEstudado } from '../engine/ofensiva.ts';
import { listarLicoes } from '../engine/progresso.ts';
import { novaEntrada } from '../engine/revisao.ts';
import { somarDias } from '../engine/relogio.ts';
import { estadoInicial, type Caderno, type Estado } from '../storage/estado.ts';

export interface PerfilDemo {
  estado: Estado | null;
  caderno: Caderno;
}

export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  construir(catalogo: Catalogo, hoje: string): PerfilDemo;
}

type Revisao = 'vencidos' | 'em-dia';

/** Marca as primeiras `n` lições de um curso como feitas, uma por dia, terminando ontem. */
function concluirPrimeiras(
  curso: CursoCatalogo | undefined,
  n: number,
  hoje: string,
  estado: Estado,
  caderno: Caderno,
  revisao: Revisao,
): void {
  if (!curso) return;
  const licoes = listarLicoes(curso).slice(0, n);
  licoes.forEach((l, i) => {
    const em = somarDias(hoje, -(licoes.length - i));
    const total = l.licao.nExercicios;
    estado.licoesConcluidas[l.id] = { acertos: Math.max(0, total - (i % 2)), total, em };
    for (const id of l.licao.ensina) {
      const e = novaEntrada(id, l.id, em);
      const k = Object.keys(caderno).length;
      caderno[id] =
        revisao === 'vencidos' && k < 6
          ? {
              ...e,
              caixa: 1 + (k % 4),
              proximaRevisao: somarDias(hoje, -(k % 3)),
              ultimaRevisao: em,
            }
          : { ...e, caixa: 1 + (k % 5), proximaRevisao: somarDias(hoje, 2 + (k % 6)) };
    }
  });
}

function base(hoje: string, meta: 20 | 50 | 100 = 50): Estado {
  return estadoInicial(meta, hoje);
}

function comEstudo(
  e: Estado,
  hoje: string,
  dias: number,
  recorde: number,
  xp: number,
  xpHoje: number,
): Estado {
  let estudados: string[] = [];
  for (let i = dias - 1; i >= 0; i--)
    estudados = registrarDiaEstudado(estudados, somarDias(hoje, -i), hoje);
  return {
    ...e,
    xp,
    xpHoje: { dia: hoje, valor: xpHoje },
    ofensiva: { atual: dias, recorde, ultimoDia: hoje },
    diasEstudados: estudados,
  };
}

export const PERFIS: Perfil[] = [
  {
    id: 'recem-chegado',
    nome: 'Recém-chegado',
    descricao: 'Nada salvo: Home do visitante, janela da meta diária, Caderno vazio.',
    construir: () => ({ estado: null, caderno: {} }),
  },
  {
    id: 'um-curso-so',
    nome: 'Um curso só',
    descricao: '3 dias de ofensiva, curso 1 com 3 lições feitas, nenhum outro curso liberado.',
    construir(catalogo, hoje) {
      const curso = catalogo.cursos[0];
      const caderno: Caderno = {};
      const estado = comEstudo(base(hoje), hoje, 3, 3, 150, 20);
      estado.cursoAtual = curso?.id ?? null;
      concluirPrimeiras(curso, 3, hoje, estado, caderno, 'vencidos');
      return { estado, caderno };
    },
  },
  ...(['vencidos', 'em-dia'] as const).map<Perfil>((revisao) => ({
    id: revisao === 'vencidos' ? 'em-andamento' : 'tudo-em-dia',
    nome: revisao === 'vencidos' ? 'Em andamento' : 'Tudo em dia',
    descricao:
      revisao === 'vencidos'
        ? '7 dias de ofensiva (recorde 12), 30/50 XP hoje, curso 1 com 5 lições, curso 2 liberado com 1, vários conceitos vencidos.'
        : 'Como "Em andamento", mas nenhum conceito vencido.',
    construir(catalogo: Catalogo, hoje: string) {
      const [c1, c2] = catalogo.cursos;
      const caderno: Caderno = {};
      const estado = comEstudo(base(hoje), hoje, 7, 12, 340, 30);
      estado.cursoAtual = c2 ? c2.id : (c1?.id ?? null);
      concluirPrimeiras(c1, 5, hoje, estado, caderno, revisao);
      concluirPrimeiras(c2, 1, hoje, estado, caderno, revisao);
      const proxima = c2 ? listarLicoes(c2)[1] : c1 ? listarLicoes(c1)[5] : undefined;
      if (proxima) estado.licaoEmAndamento = { id: proxima.id, etapa: 'explicacao', card: 0 };
      return { estado, caderno };
    },
  })),
  {
    id: 'curso-1-completo',
    nome: 'Curso 1 completo',
    descricao: 'Todo o curso 1 feito; o curso 3 ainda bloqueado. Serve para ver desbloqueios.',
    construir(catalogo, hoje) {
      const curso = catalogo.cursos[0];
      const caderno: Caderno = {};
      const estado = comEstudo(base(hoje), hoje, 5, 5, 520, 50);
      estado.cursoAtual = curso?.id ?? null;
      concluirPrimeiras(curso, 100, hoje, estado, caderno, 'em-dia');
      return { estado, caderno };
    },
  },
];
