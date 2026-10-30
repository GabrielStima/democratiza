import { describe, expect, it } from 'vitest';
import { catalogoLorem, estadoDeTeste } from '../testes/catalogo.ts';
import { concluirLicao, concluirRevisao } from './sessao.ts';
import { novaEntrada } from './revisao.ts';

const catalogo = catalogoLorem();
const modelo = 'comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';
const resultado = {
  licaoId: modelo,
  acertosPrimeira: 5,
  total: 6,
  xpBruto: 55,
  conceitosErrados: [],
};

describe('concluir lição', () => {
  const dia = '2026-10-28';

  it('grava a lição, soma 55 XP, abre a ofensiva e põe os conceitos na caixa 1', () => {
    const r = concluirLicao(estadoDeTeste(dia), {}, catalogo, resultado, dia);
    expect(r.xpGanho).toBe(55);
    expect(r.estado.xp).toBe(55);
    expect(r.estado.xpHoje).toEqual({ dia, valor: 55 });
    expect(r.estado.ofensiva).toEqual({ atual: 1, recorde: 1, ultimoDia: dia });
    expect(r.estado.diasEstudados).toEqual([dia]);
    expect(r.estado.cursoAtual).toBe('comece-por-aqui');
    expect(r.estado.licoesConcluidas[modelo]).toEqual({ acertos: 5, total: 6, em: dia });
    expect(r.novosConceitos).toEqual(['lorem-01', 'lorem-02', 'lorem-03']);
    expect(r.caderno['lorem-01']).toMatchObject({
      caixa: 1,
      proximaRevisao: '2026-10-29',
      licaoId: modelo,
    });
    expect(r.refeita).toBe(false);
  });

  it('refazer a mesma lição não dá XP, não duplica conceitos e mantém o resultado da primeira vez', () => {
    const primeira = concluirLicao(estadoDeTeste(dia), {}, catalogo, resultado, dia);
    const outraVez = concluirLicao(
      primeira.estado,
      primeira.caderno,
      catalogo,
      { ...resultado, acertosPrimeira: 6, xpBruto: 60 },
      '2026-10-29',
    );
    expect(outraVez.refeita).toBe(true);
    expect(outraVez.xpGanho).toBe(0);
    expect(outraVez.estado.xp).toBe(55);
    expect(outraVez.novosConceitos).toEqual([]);
    expect(outraVez.estado.licoesConcluidas[modelo]?.acertos).toBe(5);
    expect(outraVez.estado.ofensiva.atual).toBe(2);
  });

  it('conceito de pergunta errada volta para a caixa 1', () => {
    const anterior = { 'lorem-01': { ...novaEntrada('lorem-01', 'x', '2026-10-01'), caixa: 4 } };
    const r = concluirLicao(
      estadoDeTeste(dia),
      anterior,
      catalogo,
      { ...resultado, conceitosErrados: ['lorem-01'] },
      dia,
    );
    expect(r.caderno['lorem-01']).toMatchObject({ caixa: 1, proximaRevisao: '2026-10-29' });
    expect(r.novosConceitos).toEqual(['lorem-02', 'lorem-03']);
  });

  it('anuncia o curso liberado e limpa a lição em andamento', () => {
    const ate = [
      'lorem-01',
      'lorem-02',
      'lorem-03',
      'lorem-04',
      'lorem-05',
      'lorem-06',
      'lorem-07',
    ];
    const caderno = Object.fromEntries(ate.map((id) => [id, novaEntrada(id, 'l', '2026-10-01')]));
    const estado = {
      ...estadoDeTeste(dia),
      licaoEmAndamento: {
        id: 'comece-por-aqui/lorem-unidade-dois/lorem-licao-tres',
        etapa: 'pratica' as const,
      },
    };
    const r = concluirLicao(
      estado,
      caderno,
      catalogo,
      { ...resultado, licaoId: 'comece-por-aqui/lorem-unidade-dois/lorem-licao-tres' },
      dia,
    );
    expect(r.desbloqueios.map((c) => c.id)).toEqual(['aprofundamento-lorem']);
    expect(r.estado.licaoEmAndamento).toBeNull();
  });

  it('recusa uma lição que não existe', () => {
    expect(() =>
      concluirLicao(estadoDeTeste(dia), {}, catalogo, { ...resultado, licaoId: 'x/y/z' }, dia),
    ).toThrow('Lição desconhecida');
  });
});

describe('concluir revisão', () => {
  const dia = '2026-10-28';
  const caderno = {
    a: { ...novaEntrada('a', 'l', '2026-10-01'), caixa: 2, proximaRevisao: '2026-10-27' },
    b: { ...novaEntrada('b', 'l', '2026-10-01'), caixa: 3, proximaRevisao: '2026-10-27' },
  };
  const resultados = [
    { conceitoId: 'a', acertou: true },
    { conceitoId: 'b', acertou: false },
  ];

  it('soma XP, conta para a ofensiva e mostra como cada conceito ficou', () => {
    const r = concluirRevisao(estadoDeTeste(dia), caderno, resultados, 15, dia);
    expect(r.xpGanho).toBe(15);
    expect(r.estado.xp).toBe(15);
    expect(r.estado.ofensiva.atual).toBe(1);
    expect(r.mudancas).toEqual([
      { conceitoId: 'a', de: 2, para: 3, voltaEmDias: 7 },
      { conceitoId: 'b', de: 3, para: 1, voltaEmDias: 1 },
    ]);
  });

  it('treino livre não dá XP, não conta ofensiva e não mexe nas caixas', () => {
    const estado = estadoDeTeste(dia);
    const r = concluirRevisao(estado, caderno, resultados, 15, dia, 'treino');
    expect(r.estado).toBe(estado);
    expect(r.caderno).toBe(caderno);
    expect(r.xpGanho).toBe(0);
  });
});
