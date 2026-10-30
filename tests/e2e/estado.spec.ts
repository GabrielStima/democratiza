import { expect, test } from '@playwright/test';

test.describe('estado e perfis (com rascunhos ligados)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

  test('carregar "Em andamento" reproduz 7 dias e 6 conceitos vencidos, e sobrevive ao recarregar', async ({
    page,
  }) => {
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Em andamento' }).click();
    const fatos = page.getByTestId('fatos');
    await expect(fatos).toContainText('Ofensiva exibida7');
    await expect(fatos).toContainText('Conceitos vencidos6');
    await page.reload();
    await expect(page.getByTestId('fatos')).toContainText('Ofensiva exibida7');
    await expect(page.getByTestId('fatos')).toContainText('Conceitos vencidos6');
  });

  test('"Tudo em dia" não tem conceitos vencidos', async ({ page }) => {
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Tudo em dia' }).click();
    await expect(page.getByTestId('fatos')).toContainText('Conceitos vencidos0');
  });

  test('a rota / muda de Home conforme exista progresso', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Home do visitante' })).toBeVisible();
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Um curso só' }).click();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Home com progresso' })).toBeVisible();
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Limpar tudo' }).click();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Home do visitante' })).toBeVisible();
  });

  test('avançar dias sem estudar: em risco após 1, zerada após 2', async ({ page }) => {
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Em andamento' }).click();
    await page.getByRole('button', { name: 'Avançar 1 dia' }).click();
    await expect(page.getByTestId('fatos')).toContainText('Ofensiva exibida7 (em risco)');
    await page.getByRole('button', { name: 'Avançar 1 dia' }).click();
    await expect(page.getByTestId('fatos')).toContainText('Ofensiva exibida0');
  });
});

test.describe('produção (sem rascunhos)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS === '1', 'só vale no build de produção');

  test('o relógio de teste não existe no site no ar', async ({ page }) => {
    const textos: string[] = [];
    page.on('response', async (r) => {
      if (/\.js$/.test(r.url())) textos.push(await r.text().catch(() => ''));
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(textos.join('\n')).not.toContain('democratiza:dev-dias');
  });
});
