import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('uma rota que não existe mostra a página 404', async ({ page }) => {
  await page.goto('/qualquer-coisa');
  await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir para o início' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver os cursos' })).toBeVisible();
});

test('as rotas principais respondem com a página provisória', async ({ page }) => {
  for (const rota of ['/cursos']) {
    await page.goto(rota);
    await expect(page.getByText(/Em construção/)).toBeVisible();
  }
});

test('o 404 não tem problema sério de acessibilidade', async ({ page }) => {
  await page.goto('/nao-existe');
  const resultado = await new AxeBuilder({ page }).analyze();
  const graves = resultado.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(graves).toEqual([]);
});

test.describe('telas de desenvolvimento', () => {
  test.skip(
    process.env.VITE_MOSTRAR_RASCUNHOS !== '1',
    'só existem quando os rascunhos estão ligados',
  );

  test('o guia de estilo abre e a janela fecha com Esc', async ({ page }) => {
    await page.goto('/_estilo');
    await expect(page.getByRole('heading', { name: 'Guia de estilo' })).toBeVisible();
    await page.getByRole('button', { name: 'Abrir janela' }).click();
    await expect(page.getByRole('dialog', { name: 'Janela de exemplo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar a lição' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test('em produção o guia de estilo não existe', async ({ page }) => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS === '1', 'só vale no build de produção');
  await page.goto('/_estilo');
  await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
});
