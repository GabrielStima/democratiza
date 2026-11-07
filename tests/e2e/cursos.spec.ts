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

test('o 404 leva ao catálogo', async ({ page }) => {
  await page.goto('/nao-existe');
  await page.getByRole('link', { name: 'Ver os cursos' }).click();
  await expect(page).toHaveURL(/\/cursos$/);
});

test.describe('com rascunhos ligados', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('o visitante vê o catálogo e a Introdução liberada, sem problema sério de acessibilidade', async ({
    page,
  }) => {
    await page.goto('/cursos');
    await expect(page.getByRole('heading', { level: 1, name: 'Cursos' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Introdução' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar curso/ }).first()).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });

  test('a busca ignora acento e maiúscula e avisa quando não acha nada', async ({ page }) => {
    await page.goto('/cursos');
    const busca = page.getByRole('searchbox', { name: 'Buscar curso' });
    await busca.fill('COMECE');
    await expect(page.getByRole('heading', { level: 2, name: 'Introdução' })).toBeVisible();
    await busca.fill('zzzzzz');
    await expect(page.getByText(/Nenhum curso encontrado/)).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
  });

  test('o menu lateral leva ao catálogo e marca Cursos como página atual', async ({ page }) => {
    await page.goto('/_dev');
    await clicarPerfil(page, 'Um curso só');
    await page.goto('/cursos');
    await expect(
      page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Cursos' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('visitante: os cursos que pedem conceitos aparecem bloqueados e sem botão', async ({
    page,
  }) => {
    await page.goto('/cursos');
    await expect(page.getByText('Bloqueado')).toHaveCount(2);
    await expect(page.getByText('Faltam estes conceitos:')).toHaveCount(2);
    await expect(page.getByText(/Você aprende .* em “/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar curso/ })).toHaveCount(1);
  });

  test('"Um curso só": curso em andamento com barra e botão Continuar', async ({ page }) => {
    await carregar(page, 'Um curso só');
    await page.goto('/cursos');
    await expect(page.getByText(/\d+% feito/)).toBeVisible();
    await expect(page.getByRole('progressbar', { name: /Progresso em/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Continuar/ })).toBeVisible();
  });

  test('"Curso 1 completo": concluído, o seguinte liberado e o último bloqueado', async ({
    page,
  }) => {
    await carregar(page, 'Curso 1 completo');
    await page.goto('/cursos');
    await expect(page.getByText('Concluído', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rever curso/ })).toBeVisible();
    await expect(page.getByText('Liberado', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar curso/ })).toBeVisible();
    await expect(page.getByText('Bloqueado', { exact: true })).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test.describe('sem rascunhos (produção)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS === '1', 'só vale quando não há rascunhos');

  test('sem curso publicado, avisa que os cursos estão sendo escritos', async ({ page }) => {
    await page.goto('/cursos');
    await expect(page.getByText(/ainda estão sendo escritos/)).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});
