import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

async function carregar(page: Page, perfil: string) {
  await page.goto('/_dev');
  await page.getByRole('button', { name: `Carregar perfil: ${perfil}` }).click();
  await expect(page.getByTestId('fatos')).toBeVisible();
}

test('sem progresso: Caderno vazio e Revisar sem nada para revisar', async ({ page }) => {
  await page.goto('/caderno');
  await expect(page.getByRole('heading', { name: 'Seu caderno ainda está vazio' })).toBeVisible();
  if (process.env.VITE_MOSTRAR_RASCUNHOS === '1') {
    await expect(page.getByRole('link', { name: 'Fazer a primeira lição' })).toBeVisible();
  }
  expect(await graves(page)).toEqual([]);

  await page.goto('/revisar');
  await expect(page.getByRole('heading', { name: 'Nada para revisar ainda' })).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test.describe('com rascunhos ligados', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('Revisar: o número bate com o do menu e a sessão esvazia a lista', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/revisar');
    await expect(page.getByRole('heading', { name: '6 conceitos para revisar' })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: /^Revisar\s*6/ }),
    ).toBeVisible();
    await expect(
      page.getByText('Esse treino não vale XP e não muda o seu calendário.'),
    ).toBeVisible();
    expect(await graves(page)).toEqual([]);

    await page.getByRole('button', { name: 'Começar revisão' }).click();
    await expect(page).toHaveURL(/\/revisar\/sessao$/);
    for (let i = 1; i <= 6; i++) {
      await expect(page.getByText(`${i} de 6`, { exact: false }).first()).toBeVisible();
      await page.getByRole('radio').first().check();
      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    }
    await expect(page.getByRole('heading', { name: 'Revisão concluída!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Como ficaram seus conceitos' })).toBeVisible();
    await expect(page.getByText(/^Força \d → \d/)).toHaveCount(6);
    expect(await graves(page)).toEqual([]);

    await page.getByRole('button', { name: 'Ver o caderno' }).click();
    await expect(page).toHaveURL(/\/caderno$/);

    await page.goto('/revisar');
    await expect(page.getByRole('heading', { name: 'Tudo em dia!' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Começar revisão' })).toHaveCount(0);
    expect(await graves(page)).toEqual([]);
  });

  test('"Tudo em dia": mostra quando volta o próximo e deixa treinar um curso', async ({
    page,
  }) => {
    await carregar(page, 'Tudo em dia');
    await page.goto('/revisar');
    await expect(page.getByRole('heading', { name: 'Tudo em dia!' })).toBeVisible();
    await expect(page.getByText(/O próximo vence/)).toBeVisible();
    await page.getByRole('button', { name: 'Treinar este curso' }).click();
    await expect(page).toHaveURL(/\/revisar\/treino\//);
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    // No treino livre não há XP nem aviso de que a pergunta volta na revisão.
    await expect(page.getByText('Essa pergunta volta na sua revisão.')).toHaveCount(0);
    await expect(page.getByText(/\+\d+ XP/)).toHaveCount(0);
  });

  test('sair da revisão pede confirmação e não muda nada', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/revisar/sessao');
    await page.getByRole('button', { name: 'Sair da lição' }).click();
    const janela = page.getByRole('dialog', { name: 'Sair da revisão?' });
    await expect(janela).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(janela).toHaveCount(0);
    await page.getByRole('button', { name: 'Sair da lição' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page).toHaveURL(/\/revisar$/);
    await expect(page.getByRole('heading', { name: '6 conceitos para revisar' })).toBeVisible();
  });

  test('Caderno: busca, filtro por curso e cartão do conceito', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/caderno');
    const lista = page.getByRole('button', { pressed: false });
    await expect(lista.first()).toBeVisible();
    expect(await graves(page)).toEqual([]);

    await page.getByRole('searchbox', { name: 'Buscar conceito' }).fill('zzzz');
    await expect(page.getByText('Nenhum conceito encontrado')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Buscar conceito' }).fill('');

    await page.getByRole('button', { pressed: false }).first().click();
    const cartao = page.getByRole('article', { name: 'Cartão do conceito' });
    await expect(cartao.getByText(/^Força \d de 5/)).toBeVisible();
    await expect(cartao.getByText('Em uma frase')).toBeVisible();
    await expect(cartao.getByText(/^Fonte:/)).toBeVisible();
    await cartao.getByRole('button', { name: 'Rever explicação' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    await cartao.getByRole('link', { name: 'Praticar agora' }).click();
    await expect(page).toHaveURL(/\/caderno\/praticar\//);
    await expect(page.getByRole('radio').first()).toBeVisible();
  });
});
