import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { clicarPerfil } from './perfil';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

async function carregar(page: Page, perfil: string) {
  await page.goto('/_dev');
  await clicarPerfil(page, perfil);
}

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.describe('M15 · Caderno e Revisar no celular', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

  test('Caderno: busca larga, filtros que rolam de lado e cartão aberto no próprio lugar', async ({
    page,
  }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/caderno');
    const busca = await page.getByRole('searchbox', { name: 'Buscar conceito' }).boundingBox();
    expect(Math.round(busca!.width)).toBe(390 - 32);

    // A fileira de filtros é a única coisa que rola de lado.
    const filtros = page.getByRole('group', { name: 'Filtrar por curso' });
    const rola = await filtros.evaluate((e) => e.scrollWidth > e.clientWidth);
    expect(rola).toBe(true);
    expect(await semRolagemLateral(page)).toBe(true);

    // Acordeão: tudo começa fechado; o cartão abre logo embaixo do item tocado.
    await expect(page.getByRole('article', { name: 'Cartão do conceito' })).toHaveCount(0);
    const itens = page.locator('main ul li');
    const primeiro = itens.nth(0).getByRole('button').first();
    await expect(primeiro).toHaveAttribute('aria-expanded', 'false');
    await primeiro.click();
    await expect(primeiro).toHaveAttribute('aria-expanded', 'true');
    const cartao = itens.nth(0).getByRole('article', { name: 'Cartão do conceito' });
    await expect(cartao).toBeVisible();
    for (const t of ['No dia a dia', 'Não confunda com', 'Aprendido em:', 'Fonte:']) {
      await expect(cartao.getByText(t)).toBeVisible();
    }
    const [bi, bc] = [await primeiro.boundingBox(), await cartao.boundingBox()];
    expect(bc!.y).toBeGreaterThan(bi!.y + bi!.height - 1);
    for (const nome of ['Rever explicação', 'Praticar agora']) {
      const b = await cartao
        .getByRole('button', { name: nome })
        .or(cartao.getByRole('link', { name: nome }))
        .boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);

    // Abrir outro item fecha o primeiro; tocar de novo no aberto fecha.
    const segundo = itens.nth(1).getByRole('button').first();
    await segundo.click();
    await expect(primeiro).toHaveAttribute('aria-expanded', 'false');
    await expect(segundo).toHaveAttribute('aria-expanded', 'true');
    await segundo.click();
    await expect(page.getByRole('article', { name: 'Cartão do conceito' })).toHaveCount(0);
  });

  test('Caderno: Rever explicação abre uma folha de baixo', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/caderno');
    await page.locator('main ul li').first().getByRole('button').first().click();
    await page.getByRole('button', { name: 'Rever explicação' }).click();
    const janela = page.getByRole('dialog');
    await expect(janela).toBeVisible();
    await page.waitForTimeout(300);
    const b = await janela.boundingBox();
    expect(Math.round(b!.y + b!.height)).toBe(844);
    await page.keyboard.press('Escape');
    await expect(janela).toBeHidden();
  });

  test('Revisar com conceitos vencidos: cartão verde, forças em linha e três cartões', async ({
    page,
  }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/revisar');
    await expect(page.getByRole('heading', { name: /conceitos para revisar/ })).toBeVisible();
    const comecar = await page.getByRole('button', { name: 'Começar revisão' }).boundingBox();
    expect(comecar!.width).toBeGreaterThan(250);

    const passos = page.getByRole('region', { name: 'Como funciona' }).locator('li');
    await expect(passos).toHaveCount(5);
    const ys = await passos.evaluateAll((es) =>
      es.map((e) => Math.round(e.getBoundingClientRect().y)),
    );
    expect(new Set(ys).size).toBe(1);

    const proximas = page.getByRole('region', { name: 'Próximas revisões' }).locator('li');
    await expect(proximas).toHaveCount(3);
    const yp = await proximas.evaluateAll((es) =>
      es.map((e) => Math.round(e.getBoundingClientRect().y)),
    );
    expect(new Set(yp).size).toBe(1);

    await expect(page.getByRole('heading', { name: 'Quer treinar mais?' })).toBeVisible();
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  });

  test('Revisar em dia e 404: sem rolagem lateral e sem problema grave', async ({ page }) => {
    await carregar(page, 'Tudo em dia');
    await page.goto('/revisar');
    await expect(page.getByRole('heading', { name: 'Tudo em dia!' })).toBeVisible();
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
    await page.goto('/pagina-que-nao-existe');
    await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  });
});

test('Caderno vazio e Revisar sem progresso cabem em 390 px', async ({ page }) => {
  for (const rota of ['/caderno', '/revisar']) {
    await page.goto(rota);
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  }
});
