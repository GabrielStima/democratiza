import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODELO = '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';
const CERTAS = ['2', 'Tempor incididunt', 'Consectetur adipiscing', 'Falso', 'Verdadeiro', 'Ipsum'];

test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const botao = (page: Page, nome: string) => page.getByRole('button', { name: nome, exact: true });

async function ateAPratica(page: Page) {
  await page.goto(MODELO);
  await page.getByLabel('Sit amet consectetur').check();
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Ver explicação').click();
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Entendi').click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await botao(page, 'Verificar').click();
  await expect(page.getByText('Isso!')).toBeVisible();
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Continuar').click();
  await botao(page, 'Entendi').click();
  await page.getByLabel('Adipiscing', { exact: true }).check();
  await botao(page, 'Verificar').click();
  await expect(page.getByText('Quase! E tudo bem, aqui não perde ponto.')).toBeVisible();
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Continuar').click();
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Começar prática').click();
}

async function responder(page: Page, opcao: string) {
  await page.getByRole('radio', { name: opcao, exact: true }).check();
  await botao(page, 'Verificar').click();
}

test('lição completa com 1 erro em 390 px: 55 XP e 5 de 6, como no desktop', async ({ page }) => {
  await ateAPratica(page);

  // O avanço fica só na barra do topo; a pergunta vem num balão ao lado da Capi.
  await expect(page.getByRole('progressbar', { name: 'Progresso da prática' })).toHaveCount(0);
  const pergunta = page.getByRole('heading', { level: 1 });
  const capi = page.locator('main img').first();
  const [bp, bc] = [await pergunta.boundingBox(), await capi.boundingBox()];
  expect(bc!.x + bc!.width).toBeLessThanOrEqual(bp!.x);

  const rodape = page.locator('footer');
  const fundoNeutro = await rodape.evaluate((e) => getComputedStyle(e).backgroundColor);

  await responder(page, CERTAS[0] as string);
  await expect(page.getByText('Mandou bem! +10 XP')).toBeVisible();
  const fundoCerto = await rodape.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(fundoCerto).not.toBe(fundoNeutro);
  expect(await semRolagemLateral(page)).toBe(true);
  expect(await graves(page)).toEqual([]);
  await botao(page, 'Continuar').click();
  await responder(page, CERTAS[1] as string);
  await botao(page, 'Continuar').click();

  await responder(page, 'Sed do eiusmod');
  await expect(page.getByText('Resposta certa: Consectetur adipiscing')).toBeVisible();
  await expect(page.getByText('Essa pergunta volta na sua revisão.')).toBeVisible();
  const fundoErrado = await rodape.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(fundoErrado).not.toBe(fundoCerto);
  expect(fundoErrado).not.toBe(fundoNeutro);
  expect(await semRolagemLateral(page)).toBe(true);
  await botao(page, 'Continuar').click();

  // Verdadeiro e Falso ficam lado a lado, em duas colunas.
  await page.getByRole('radio', { name: 'Falso', exact: true }).check();
  const [bv, bf] = [
    await page.getByText('Verdadeiro', { exact: true }).boundingBox(),
    await page.getByText('Falso', { exact: true }).boundingBox(),
  ];
  expect(Math.abs(bv!.y - bf!.y)).toBeLessThan(4);
  expect(bf!.x).toBeGreaterThan(bv!.x);
  await botao(page, 'Verificar').click();
  await botao(page, 'Continuar').click();
  for (const certa of CERTAS.slice(4)) {
    await responder(page, certa);
    await botao(page, 'Continuar').click();
  }
  await responder(page, 'Consectetur adipiscing');
  await botao(page, 'Continuar').click();

  await expect(page.getByRole('heading', { name: 'Lição concluída!' })).toBeVisible();
  const resultado = page.getByRole('list', { name: 'Resultado' });
  await expect(resultado).toContainText('Total de XP');
  await expect(resultado).toContainText('55');
  await expect(resultado).toContainText('5 de 6');
  await expect(resultado).toContainText('Tempo');
  await expect(page.getByText('3 conceitos novos no seu caderno')).toBeVisible();
  expect(await semRolagemLateral(page)).toBe(true);
  expect(await graves(page)).toEqual([]);
  const dados = await page.evaluate(() => {
    const bruto = localStorage.getItem('democratiza:v1');
    return bruto ? (JSON.parse(bruto) as { xp: number }) : null;
  });
  expect(dados?.xp).toBe(55);

  // Os dois botões do rodapé cabem na largura do celular.
  for (const nome of ['Rever o que errei', 'Continuar']) {
    const b = await botao(page, nome).boundingBox();
    expect(b!.x + b!.width).toBeLessThanOrEqual(390);
    expect(b!.height).toBeGreaterThanOrEqual(44);
  }
  await botao(page, 'Rever o que errei').click();
  await expect(page.getByRole('heading', { name: 'O que você errou' })).toBeVisible();
  expect(await semRolagemLateral(page)).toBe(true);
});

test('o confete é decorativo: escondido do leitor de tela e parado com menos movimento', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ateAPratica(page);
  for (const certa of CERTAS) {
    await responder(page, certa);
    await botao(page, 'Continuar').click();
  }
  await expect(page.getByRole('heading', { name: 'Lição concluída!' })).toBeVisible();
  const confetes = page.locator('[aria-hidden="true"]:has(> span)').first();
  await expect(confetes).toHaveCount(1);
  const animacao = await confetes
    .locator('> span')
    .first()
    .evaluate((e) => getComputedStyle(e).animationName);
  expect(animacao).toBe('none');
});

test('Rever explicação abre uma folha colada embaixo e fecha com Esc', async ({ page }) => {
  await ateAPratica(page);
  await page.getByRole('button', { name: 'Rever explicação' }).click();
  const janela = page.getByRole('dialog');
  await expect(janela).toBeVisible();
  await page.waitForTimeout(300);
  const b = await janela.boundingBox();
  expect(Math.round(b!.y + b!.height)).toBe(844);
  expect(Math.round(b!.width)).toBe(390);
  await page.keyboard.press('Escape');
  await expect(janela).toBeHidden();
});
