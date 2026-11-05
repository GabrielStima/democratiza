import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LICAO = '/c/modulo-lorem/lorem-modulo-um/lorem-licao-nove';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

/** Da Situação até a última pergunta da Prática (o debate), sem erros no caminho. */
async function ateODebate(page: Page) {
  await page.goto(LICAO);
  await page.getByLabel('Ipsum dolor', { exact: true }).check();
  await page.getByRole('button', { name: 'Ver explicação' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Começar prática' }).click();
  for (const i of [1, 1, 2]) {
    await page.getByRole('radio').nth(i).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
}

test.describe('debate entre correntes (com rascunhos ligados)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('a pergunta mostra o selo e o argumento, e o quadro só aparece depois de verificar', async ({
    page,
  }) => {
    await ateODebate(page);
    await expect(page.getByText('Debate acadêmico', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'De qual leitura vem este argumento?' }),
    ).toBeVisible();
    await expect(page.getByRole('blockquote')).toContainText(
      '“Lorem ipsum dolor sit amet, consectetur adipiscing elit.”',
    );
    await expect(page.getByRole('radio')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: /As duas leituras/ })).toHaveCount(0);
    expect(await graves(page)).toEqual([]);

    // Errar: a certa fica marcada e o quadro mostra as duas leituras com a referência de cada uma.
    await page.getByLabel('Leitura ipsum (2005)').check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Resposta certa: Leitura lorem (1990)')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'As duas leituras, lado a lado' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leitura lorem (1990)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leitura ipsum (2005)' })).toBeVisible();
    await expect(page.getByText(/Aqui não existe resposta certa sobre qual leitura/)).toBeVisible();
    await expect(page.getByText(/Lorem Ipsum, fonte de exemplo, cap. 63, p. 630/)).toBeVisible();
    await expect(page.getByRole('link', { name: /cap. 64, p. 640/ })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(await graves(page)).toEqual([]);
  });

  test('responder só com o teclado e terminar a lição', async ({ page }) => {
    await ateODebate(page);
    // Ao trocar de pergunta o app leva o foco ao conteúdo novo; só depois o teclado é da pessoa.
    await expect(page.locator('main [tabindex="-1"]')).toBeFocused();
    await page.getByLabel('Leitura lorem (1990)').focus();
    await page.keyboard.press('Space');
    // Espera a escolha chegar ao botão: apertar Enter antes disso não faz nada.
    await expect(page.getByRole('button', { name: 'Verificar' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.getByRole('button', { name: 'Verificar' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Mandou bem!/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /As duas leituras/ })).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Lição concluída!' })).toBeVisible();
  });
});
