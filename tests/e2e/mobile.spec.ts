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

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe('M12 · base mobile', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

  test('o app tem barra do topo e barra de abas, e não tem o menu lateral', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/cursos');
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ver os cursos' })).toBeVisible();
    await expect(page.getByText('7 dias seguidos')).toBeAttached();
    await expect(page.getByText('XP hoje')).toBeAttached();
    const abas = page.getByRole('navigation', { name: 'Principal' });
    for (const nome of ['Aprender', 'Cursos', 'Revisar', 'Caderno', 'Sobre']) {
      await expect(abas.getByRole('link', { name: new RegExp(`^${nome}`) })).toBeVisible();
    }
    await expect(abas.getByRole('link', { name: /^Cursos/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    // O número de conceitos vencidos aparece na aba Revisar.
    await expect(abas.getByRole('link', { name: /^Revisar/ })).toContainText(/\d/);
  });

  test('a barra de abas fica fixa embaixo, com alvos de pelo menos 44 px', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/sobre');
    const caixa = await page.getByRole('navigation', { name: 'Principal' }).boundingBox();
    expect(caixa).not.toBeNull();
    expect(Math.round(caixa!.y + caixa!.height)).toBe(844);
    for (const aba of await page
      .getByRole('navigation', { name: 'Principal' })
      .locator('a')
      .all()) {
      const b = await aba.boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
      expect(b!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('nenhuma rota principal tem rolagem horizontal em 390 px', async ({ page }) => {
    await carregar(page, 'Em andamento');
    for (const rota of ['/', '/cursos', '/revisar', '/caderno', '/sobre', '/rota-que-nao-existe']) {
      await page.goto(rota);
      await page.waitForLoadState('networkidle');
      expect(await semRolagemLateral(page), `rolagem lateral em ${rota}`).toBe(true);
    }
  });

  test('o visitante vê o cabeçalho com a marca e o botão Começar, sem o menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'democratiza' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Começar' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Como funciona' })).toBeHidden();
    expect(await semRolagemLateral(page)).toBe(true);
  });

  test('a lição tem só o X e a barra de progresso no topo', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await page.getByRole('link', { name: /^Começar: / }).click();
    await expect(page.getByRole('button', { name: 'Sair da lição' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: /Unidade \d+ · Lição \d+/ })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Fases da lição' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Principal' })).toHaveCount(0);
    expect(await semRolagemLateral(page)).toBe(true);
  });

  test('a janela de sair da lição vira uma folha colada embaixo', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await page.getByRole('link', { name: /^Começar: / }).click();
    await page.getByRole('button', { name: 'Sair da lição' }).click();
    const janela = page.getByRole('dialog', { name: 'Sair da lição?' });
    await expect(janela).toBeVisible();
    await page.waitForTimeout(300);
    const b = await janela.boundingBox();
    expect(Math.round(b!.y + b!.height)).toBe(844);
    expect(Math.round(b!.width)).toBe(390);
    await page.keyboard.press('Escape');
    await expect(janela).toBeHidden();
  });

  test('cruzar 1024 px troca o layout sem perder o que a pessoa digitou', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/caderno');
    const busca = page.getByRole('searchbox').first();
    await busca.fill('poder');
    await expect(page.locator('aside')).toHaveCount(0);
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(page.locator('aside')).toHaveCount(1);
    await expect(page.getByRole('searchbox').first()).toHaveValue('poder');
    await page.setViewportSize({ width: 1023, height: 800 });
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.getByRole('searchbox').first()).toHaveValue('poder');
  });

  test('o aviso aparece acima da barra de abas', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/_estilo');
    await page.getByRole('button', { name: 'Mostrar aviso' }).click();
    const aviso = page.getByText('Backup salvo.');
    await expect(aviso).toBeVisible();
    const a = await aviso.boundingBox();
    const abas = await page.getByRole('navigation', { name: 'Principal' }).boundingBox();
    expect(a!.y + a!.height).toBeLessThanOrEqual(abas!.y);
  });

  test('a seção Mobile do guia de estilo e o alternador do /_dev existem', async ({ page }) => {
    await page.goto('/_estilo');
    await expect(page.getByRole('heading', { name: 'Mobile', exact: true })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Exemplo: 55% da lição' })).toBeVisible();
    await page.goto('/_dev');
    await expect(page.getByRole('heading', { name: 'Largura' })).toBeVisible();
  });

  test('o layout mobile não tem problema sério de acessibilidade', async ({ page }) => {
    await carregar(page, 'Em andamento');
    for (const rota of ['/', '/cursos', '/caderno']) {
      await page.goto(rota);
      await page.waitForLoadState('networkidle');
      expect(await graves(page), rota).toEqual([]);
    }
  });
});
