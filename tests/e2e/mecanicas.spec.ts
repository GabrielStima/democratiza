import { expect, test } from '@playwright/test';

/** ECA Digital (LEGALIDADE.md, seção 8): as mecânicas de engajamento não usam texto de pressão. */
const PRESSAO =
  /vai perder|você perde|não desista|última chance|corra|acaba em|estude hoje para manter/i;

test.describe('M16 · mecânicas sem pressão', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

  test('a Home de quem não estudou hoje não cobra nem ameaça', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Em andamento' }).click();
    // Um dia sem estudar: a ofensiva fica "em risco" na lógica, mas a tela não pode pressionar.
    await page.getByRole('button', { name: /avançar 1 dia/i }).click();
    for (const rota of ['/', '/revisar', '/caderno']) {
      await page.goto(rota);
      await expect(page.locator('main')).toBeVisible();
      expect(await page.locator('body').innerText()).not.toMatch(PRESSAO);
    }
  });

  test('o site não pede permissão de notificação', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __pediu: boolean }).__pediu = false;
      const N = window.Notification;
      if (N) {
        N.requestPermission = () => {
          (window as unknown as { __pediu: boolean }).__pediu = true;
          return Promise.resolve('denied');
        };
      }
    });
    await page.goto('/');
    await page.goto('/cursos');
    expect(await page.evaluate(() => (window as unknown as { __pediu: boolean }).__pediu)).toBe(
      false,
    );
  });
});
