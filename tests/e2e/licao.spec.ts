import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODELO = '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';

async function xpSalvo(page: Page): Promise<number> {
  return page.evaluate(() => {
    const bruto = localStorage.getItem('democratiza:v1');
    return bruto ? (JSON.parse(bruto) as { xp: number }).xp : -1;
  });
}

test.describe('lição, parte 1 (com rascunhos ligados)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('a lição-modelo vai da Situação ao Fim da explicação', async ({ page }) => {
    await page.goto(MODELO);
    await expect(page.getByText('Rascunho', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Primeiro, uma situação/ })).toBeVisible();

    const ver = page.getByRole('button', { name: 'Ver explicação' });
    await expect(ver).toBeDisabled();
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByLabel('Lorem ipsum dolor', { exact: true }).check(); // troca de ideia
    await expect(ver).toBeEnabled();
    await ver.click();

    // Card 1: o termo do glossário abre ao clicar e fecha com Esc (sem abrir a janela de sair).
    await expect(page.getByText('Explicação · 1 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'termo1' }).click();
    await expect(page.getByRole('tooltip')).toContainText('definição curta');
    await page.getByRole('button', { name: 'termo1' }).press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Encontrou um erro?' })).toHaveAttribute(
      'href',
      /issues\/new.*lorem-licao-modelo/,
    );
    await page.getByRole('button', { name: 'Entendi' }).click();

    // Checagem do card 1: acerta.
    await expect(page.getByText('Checagem · não vale ponto')).toBeVisible();
    const verificar = page.getByRole('button', { name: 'Verificar' });
    await expect(verificar).toBeDisabled();
    await page.getByLabel('Consectetur').check();
    await verificar.click();
    await expect(page.getByText('Isso!')).toBeVisible();
    await expect(page.getByText(/Seu palpite no começo/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Card 2 e checagem final: erra, e o palpite aparece.
    await expect(page.getByText('Explicação · 2 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Sit amet').check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Quase! E tudo bem, aqui não perde ponto.')).toBeVisible();
    await expect(page.getByText('Seu palpite no começo foi: Lorem ipsum dolor')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Agora é praticar!' })).toBeVisible();
    await expect(page.getByText('Você viu 3 conceitos.')).toBeVisible();
    await page.getByRole('button', { name: 'Começar prática' }).click();
    await expect(page.getByRole('button', { name: 'Rever explicação' })).toBeVisible();
    await expect(page.getByText(/1 de 6/)).toBeVisible();
  });

  test('Voltar leva ao card anterior', async ({ page }) => {
    await page.goto(MODELO);
    await expect(page.getByRole('button', { name: 'Voltar' })).toHaveCount(0);
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Consectetur').check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Explicação · 2 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByText('Explicação · 1 de 2')).toBeVisible();
  });

  test('sair pela janela mantém o palpite ao voltar', async ({ page }) => {
    await page.goto(MODELO);
    await page.getByLabel('Adipiscing elit sed').check();
    await page.getByRole('button', { name: 'Sair da lição' }).click();
    const janela = page.getByRole('dialog', { name: 'Sair da lição?' });
    await expect(janela).toContainText('Seu avanço fica salvo');
    await janela.getByRole('button', { name: 'Continuar a lição' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(janela).toBeVisible();
    await janela.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Home do visitante' })).toBeVisible();

    await page.goBack();
    await expect(page.getByLabel('Adipiscing elit sed')).toBeChecked();
  });

  test('quem tem progresso retoma do ponto em que parou, mesmo recarregando', async ({ page }) => {
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Um curso só' }).click();
    await page.goto(MODELO);
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Consectetur').check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Explicação · 2 de 2')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Explicação · 2 de 2')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar' }).click();
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByLabel('Sit amet consectetur')).toBeChecked();
  });

  test('errar a checagem nunca muda o XP', async ({ page }) => {
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Um curso só' }).click();
    const antes = await xpSalvo(page);
    expect(antes).toBeGreaterThan(0);
    await page.goto(MODELO);
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Sit amet', { exact: true }).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Quase!')).toBeVisible();
    expect(await xpSalvo(page)).toBe(antes);
  });

  test('uma lição que não existe mostra o 404', async ({ page }) => {
    await page.goto('/c/comece-por-aqui/lorem-unidade-um/nao-existe');
    await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
  });

  test('as telas da lição não têm problema sério de acessibilidade', async ({ page }) => {
    await page.goto(MODELO);
    const graves = async () =>
      (await new AxeBuilder({ page }).analyze()).violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
    expect(await graves()).toEqual([]);
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    expect(await graves()).toEqual([]);
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Sit amet', { exact: true }).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    expect(await graves()).toEqual([]);
    await page.getByRole('button', { name: 'Sair da lição' }).click();
    expect(await graves()).toEqual([]);
  });
});

test.describe('lição em produção (sem rascunhos)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS === '1', 'só vale no build de produção');

  test('uma lição que existe só como rascunho mostra o 404', async ({ page }) => {
    await page.goto(MODELO);
    await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
  });
});
