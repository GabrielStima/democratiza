import { expect, test } from '@playwright/test';

test.describe('catálogo (com rascunhos ligados)', () => {
  test.skip(
    process.env.VITE_MOSTRAR_RASCUNHOS !== '1',
    'o conteúdo Lorem só existe quando os rascunhos estão ligados',
  );

  test('/_dev lista os 3 cursos e as 13 lições Lorem', async ({ page }) => {
    await page.goto('/_dev');
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible();
    await expect(page.getByText('3 cursos · 13 lições · 18 conceitos')).toBeVisible();
    const arvore = page.getByTestId('catalogo');
    await expect(arvore.getByText('Comece por aqui', { exact: true })).toBeVisible();
    await expect(arvore.getByText('Lorem lição modelo', { exact: true })).toBeVisible();
    await expect(arvore.getByText('Rascunho')).toHaveCount(13);
  });

  test('cada lição é baixada sob demanda, em arquivo separado', async ({ page }) => {
    const arquivos: string[] = [];
    page.on('response', (r) => arquivos.push(r.url()));
    await page.goto('/_dev');
    await page.waitForLoadState('networkidle');
    const antes = arquivos.length;
    await page.getByRole('button', { name: 'Carregar arquivo' }).first().click();
    await expect(
      page.getByText('Lição carregada: Lorem lição modelo (6 exercícios)'),
    ).toBeVisible();
    expect(arquivos.length).toBeGreaterThan(antes);
  });
});

test.describe('produção (sem rascunhos)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS === '1', 'só vale no build de produção');

  test('nenhum texto Lorem vai para o site no ar', async ({ page }) => {
    const respostas: string[] = [];
    page.on('response', async (r) => {
      if (/\.(js|css|html)$/.test(r.url()) || r.url().endsWith('/')) {
        respostas.push(await r.text().catch(() => ''));
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(respostas.join('\n').toLowerCase()).not.toContain('lorem ipsum');
  });
});
