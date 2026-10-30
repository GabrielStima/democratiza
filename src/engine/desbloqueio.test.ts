import { describe, expect, it } from 'vitest';
import type { Caderno } from '../storage/estado.ts';
import { catalogoLorem } from '../testes/catalogo.ts';
import {
  conceitosAprendidos,
  conceitosFaltantes,
  cursoLiberado,
  novosDesbloqueios,
  statusDasUnidades,
  statusDoCurso,
} from './desbloqueio.ts';
import { estadoDasLicoes, idLicao, listarLicoes } from './progresso.ts';
import { novaEntrada } from './revisao.ts';

const catalogo = catalogoLorem();
const [curso1, curso2, curso3] = catalogo.cursos as [
  (typeof catalogo.cursos)[number],
  (typeof catalogo.cursos)[number],
  (typeof catalogo.cursos)[number],
];

function cadernoCom(...ids: string[]): Caderno {
  return Object.fromEntries(ids.map((id) => [id, novaEntrada(id, 'c/u/l', '2026-10-01')]));
}
const lorem = (...ns: number[]) => ns.map((n) => `lorem-${String(n).padStart(2, '0')}`);

describe('desbloqueio de cursos', () => {
  it('o curso sem pré-requisitos está sempre liberado', () => {
    expect(cursoLiberado(curso1, new Set())).toBe(true);
  });

  it('só libera com todos os conceitos exigidos', () => {
    expect(curso2.requerConceitos).toEqual(lorem(5, 8));
    expect(cursoLiberado(curso2, conceitosAprendidos(cadernoCom(...lorem(5))))).toBe(false);
    expect(cursoLiberado(curso2, conceitosAprendidos(cadernoCom(...lorem(8))))).toBe(false);
    expect(cursoLiberado(curso2, conceitosAprendidos(cadernoCom(...lorem(5, 8))))).toBe(true);
  });

  it('diz o que falta e em que curso se aprende', () => {
    const faltam = conceitosFaltantes(
      curso2,
      conceitosAprendidos(cadernoCom(...lorem(5))),
      catalogo,
    );
    expect(faltam).toEqual([{ id: 'lorem-08', nome: 'Lorem ipsum 8', cursoId: 'comece-por-aqui' }]);
  });

  it('o status do curso muda com o caderno e o progresso', () => {
    const vazio = { licoesConcluidas: {} };
    expect(statusDoCurso(curso2, vazio, {})).toBe('bloqueado');
    expect(statusDoCurso(curso2, vazio, cadernoCom(...lorem(5, 8)))).toBe('liberado');
    const primeira = listarLicoes(curso2)[0]!;
    const feita = {
      licoesConcluidas: { [primeira.id]: { acertos: 3, total: 3, em: '2026-10-28' } },
    };
    expect(statusDoCurso(curso2, feita, cadernoCom(...lorem(5, 8)))).toBe('andamento');
    const todas = Object.fromEntries(
      listarLicoes(curso2).map((l) => [l.id, { acertos: 3, total: 3, em: '2026-10-28' }]),
    );
    expect(statusDoCurso(curso2, { licoesConcluidas: todas }, cadernoCom(...lorem(5, 8)))).toBe(
      'concluido',
    );
  });

  it('anuncia os cursos que acabaram de ser liberados', () => {
    const antes = conceitosAprendidos(cadernoCom(...lorem(1, 2, 3, 4, 5, 6, 7)));
    const depois = conceitosAprendidos(cadernoCom(...lorem(1, 2, 3, 4, 5, 6, 7, 8)));
    expect(novosDesbloqueios(catalogo, antes, depois).map((c) => c.id)).toEqual([
      'aprofundamento-lorem',
    ]);
    expect(novosDesbloqueios(catalogo, depois, depois)).toEqual([]);
  });

  it('o que este curso libera vem do grafo de conceitos', () => {
    expect(curso1.libera).toEqual([curso2.id]);
    expect(curso2.libera).toEqual([curso3.id]);
    expect(curso3.libera).toEqual([]);
  });
});

describe('ordem das lições e das unidades', () => {
  const ids = listarLicoes(curso1).map((l) => l.id);

  it('a primeira lição está liberada e as outras ficam bloqueadas', () => {
    const e = estadoDasLicoes(curso1, {});
    expect(e.get(ids[0]!)).toBe('atual');
    expect(ids.slice(1).every((id) => e.get(id) === 'bloqueada')).toBe(true);
  });

  it('uma lição só libera depois da anterior', () => {
    const e = estadoDasLicoes(curso1, { [ids[0]!]: { acertos: 1, total: 1, em: '2026-10-28' } });
    expect(e.get(ids[0]!)).toBe('feita');
    expect(e.get(ids[1]!)).toBe('atual');
    expect(e.get(ids[2]!)).toBe('bloqueada');
  });

  it('as unidades abrem em ordem', () => {
    const feitas = Object.fromEntries(
      ids.slice(0, 3).map((id) => [id, { acertos: 1, total: 1, em: '2026-10-28' }]),
    );
    const u = statusDasUnidades(curso1, feitas);
    expect([...u.values()]).toEqual(['feita', 'atual', 'bloqueada']);
  });

  it('monta o id completo da lição', () => {
    expect(idLicao('a', 'b', 'c')).toBe('a/b/c');
  });
});
