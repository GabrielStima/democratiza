import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

async function carregar(page: Page, perfil: string) {
  await page.goto('/_dev');
  await page.getByRole('button', { name: `Carregar perfil: ${perfil}` }).click();
}

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.describe('M13 · trilha no celular', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

  test('Home: a trilha mostra nós feitos, o atual e os bloqueados', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await expect(page.getByRole('link', { name: /\(feita\)$/ }).first()).toBeVisible();
    const atual = page.getByRole('link', { name: /^Começar: / });
    await expect(atual).toHaveCount(1);
    const bloqueada = page.getByRole('button', { name: /\(bloqueada\)$/ }).first();
    await expect(bloqueada).toHaveAttribute('aria-disabled', 'true');
    expect((await atual.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  });

  test('Home: tocar no nó atual abre a lição', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await page.getByRole('link', { name: /^Começar: / }).click();
    await expect(page).toHaveURL(/\/c\/[^/]+\/[^/]+\/[^/]+/);
  });

  test('Home: o nó bloqueado não navega', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    const url = page.url();
    await page
      .getByRole('button', { name: /\(bloqueada\)$/ })
      .first()
      .click({ force: true });
    expect(page.url()).toBe(url);
  });

  test('Curso: banners de unidade e trilha da unidade atual', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/cursos');
    await page
      .getByRole('link', { name: /Continuar|Ver curso|Abrir/ })
      .first()
      .click({ force: true });
    await expect(page.getByRole('link', { name: /^Começar: / })).toHaveCount(1);
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  });

  test('Cursos: sem rolagem lateral e sem problema grave de acessibilidade', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/cursos');
    expect(await semRolagemLateral(page)).toBe(true);
    expect(await graves(page)).toEqual([]);
  });

  test('Home com um curso só: mostra o progresso no curso', async ({ page }) => {
    await carregar(page, 'Um curso só');
    await page.goto('/');
    await expect(page.getByRole('link', { name: /^Começar: / })).toHaveCount(1);
    expect(await semRolagemLateral(page)).toBe(true);
  });
});

test.describe('M13 · visitante', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o curso de teste é rascunho');

  test('o nó atual abre a janela da meta diária', async ({ page }) => {
    await page.goto('/c/comece-por-aqui');
    const atual = page.getByRole('button', { name: /^Começar: / });
    await expect(atual).toBeVisible();
    await atual.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await semRolagemLateral(page)).toBe(true);
  });
});
