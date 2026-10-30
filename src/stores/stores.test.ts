import { beforeEach, describe, expect, it } from 'vitest';
import { usarRelogio } from '../engine/relogio.ts';
import { armazemMemoria } from '../storage/caderno.ts';
import { novaEntrada } from '../engine/revisao.ts';
import { armazemTextoMemoria, CHAVE_ESTADO } from '../storage/repositorio.ts';
import { gerarBackup } from '../storage/exportar.ts';
import { catalogoLorem } from '../testes/catalogo.ts';
import {
  apagarProgresso,
  caderno,
  carregado,
  comecarProgresso,
  estado,
  iniciarStores,
  mudarMeta,
  registrarConclusaoLicao,
  registrarConclusaoRevisao,
  substituirPorBackup,
} from './index.ts';

const catalogo = catalogoLorem();
const modelo = 'comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';
const resultado = {
  licaoId: modelo,
  acertosPrimeira: 5,
  total: 6,
  xpBruto: 55,
  conceitosErrados: [],
};
const espera = () => new Promise((r) => setTimeout(r, 0));

let texto = armazemTextoMemoria();
let idb = armazemMemoria();

beforeEach(async () => {
  usarRelogio(() => new Date(2026, 9, 28, 12, 0, 0));
  texto = armazemTextoMemoria();
  idb = armazemMemoria();
  await iniciarStores({ texto, caderno: idb, renomeados: {} });
});

describe('stores', () => {
  it('começa como visitante, já carregado', () => {
    expect(carregado.value).toBe(true);
    expect(estado.value).toBeNull();
    expect(caderno.value).toEqual({});
  });

  it('escolher a meta cria o progresso e salva', () => {
    comecarProgresso(20);
    expect(estado.value?.config.metaDiaria).toBe(20);
    expect(JSON.parse(texto.getItem(CHAVE_ESTADO) as string).config.metaDiaria).toBe(20);
    mudarMeta(100);
    expect(estado.value?.config.metaDiaria).toBe(100);
  });

  it('concluir uma lição atualiza estado e caderno e sobrevive a recarregar', async () => {
    comecarProgresso(50);
    const c = registrarConclusaoLicao(resultado, catalogo);
    expect(c.xpGanho).toBe(55);
    expect(estado.value?.xp).toBe(55);
    expect(Object.keys(caderno.value)).toEqual(['lorem-01', 'lorem-02', 'lorem-03']);
    await espera();

    await iniciarStores({ texto, caderno: idb, renomeados: {} });
    expect(estado.value?.licoesConcluidas[modelo]).toBeDefined();
    expect(Object.keys(caderno.value)).toHaveLength(3);
  });

  it('refazer a lição não dá XP de novo', () => {
    comecarProgresso(50);
    registrarConclusaoLicao(resultado, catalogo);
    expect(registrarConclusaoLicao(resultado, catalogo).xpGanho).toBe(0);
    expect(estado.value?.xp).toBe(55);
  });

  it('revisão muda as caixas; treino livre não muda nada', () => {
    comecarProgresso(50);
    registrarConclusaoLicao(resultado, catalogo);
    const antes = caderno.value;
    registrarConclusaoRevisao([{ conceitoId: 'lorem-01', acertou: true }], 10, 'treino');
    expect(caderno.value).toBe(antes);
    expect(estado.value?.xp).toBe(55);
    registrarConclusaoRevisao([{ conceitoId: 'lorem-01', acertou: true }], 10);
    expect(caderno.value['lorem-01']?.caixa).toBe(2);
    expect(estado.value?.xp).toBe(65);
  });

  it('apagar volta ao visitante e limpa o armazenamento', async () => {
    comecarProgresso(50);
    registrarConclusaoLicao(resultado, catalogo);
    await espera();
    await apagarProgresso();
    expect(estado.value).toBeNull();
    expect(caderno.value).toEqual({});
    expect(texto.getItem(CHAVE_ESTADO)).toBeNull();
    expect(await idb.carregar()).toEqual([]);
  });

  it('abrir um backup válido substitui o progresso', async () => {
    comecarProgresso(50);
    registrarConclusaoLicao(resultado, catalogo);
    await espera();
    const arquivo = JSON.stringify(gerarBackup(estado.value!, caderno.value, 'x'));
    await apagarProgresso();
    const r = await substituirPorBackup(arquivo);
    expect(r.ok).toBe(true);
    expect(estado.value?.xp).toBe(55);
    expect(Object.keys(caderno.value)).toHaveLength(3);
    await espera();
    expect(await idb.carregar()).toHaveLength(3);
  });

  it('um arquivo inválido nunca destrói o progresso atual', async () => {
    comecarProgresso(50);
    registrarConclusaoLicao(resultado, catalogo);
    await espera();
    const estadoAntes = estado.value;
    const cadernoAntes = caderno.value;
    for (const ruim of ['lixo', JSON.stringify({ app: 'democratiza', versao: 1 })]) {
      expect((await substituirPorBackup(ruim)).ok).toBe(false);
    }
    expect(estado.value).toBe(estadoAntes);
    expect(caderno.value).toBe(cadernoAntes);
    expect(await idb.carregar()).toHaveLength(3);
  });

  it('aplica o renomeados.json ao carregar o caderno salvo e grava a troca', async () => {
    await idb.salvar([novaEntrada('velho', 'c/u/l', '2026-10-01')]);
    await iniciarStores({ texto, caderno: idb, renomeados: { velho: 'novo' } });
    expect(Object.keys(caderno.value)).toEqual(['novo']);
    await espera();
    expect((await idb.carregar()).map((e) => e.conceitoId)).toEqual(['novo']);
  });
});
