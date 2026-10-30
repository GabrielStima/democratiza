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

test('a Home do visitante abre sem problema sério de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Entenda a política do Brasil/ })).toBeVisible();
  await expect(page.getByText('Funciona até sem internet')).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test('o topo da Home do visitante segue o design: selo, nota e faixa de diferenciais', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'democratiza' })).toBeVisible();
  await expect(page.getByText('Grátis · apartidário · sem cadastro')).toBeVisible();
  await expect(page.getByText('Seu progresso fica salvo no seu próprio navegador.')).toBeVisible();
  const faixa = page.getByRole('region', { name: 'Em resumo' });
  for (const texto of [
    'Sem lado: explica, não opina',
    'Baseado em fontes oficiais',
    'Sem cadastro e sem anúncios',
    'Funciona até sem internet',
  ]) {
    await expect(faixa.getByText(texto)).toBeVisible();
  }
});

test.describe('com rascunhos ligados', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('visitante: pergunta rápida, meta diária e primeira lição', async ({ page }) => {
    await page.goto('/');
    // As unidades vêm do catálogo.
    await expect(page.getByRole('heading', { name: 'Lorem unidade um' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lorem unidade três' })).toBeVisible();

    // Pergunta rápida de verdade: escolher mostra o resultado e a explicação.
    const pergunta = page.getByRole('group', { name: /Lorem ipsum dolor sit amet 1/ });
    await pergunta.getByRole('radio', { name: '1', exact: true }).check();
    await expect(page.getByText('Quase!')).toBeVisible();

    await page.getByRole('button', { name: 'Começar agora' }).first().click();
    const janela = page.getByRole('dialog', { name: 'Quanto você quer estudar por dia?' });
    await expect(janela.getByRole('radio', { name: /Regular · 50 XP/ })).toBeChecked();
    expect(await graves(page)).toEqual([]);
    await janela.getByRole('radio', { name: /Intenso · 100 XP/ }).check();
    await janela.getByRole('button', { name: 'Começar a primeira lição' }).click();
    await expect(page).toHaveURL(/lorem-licao-modelo$/);
    const salvo = await page.evaluate(
      () =>
        (
          JSON.parse(localStorage.getItem('democratiza:v1') ?? 'null') as {
            config: { metaDiaria: number };
          } | null
        )?.config.metaDiaria,
    );
    expect(salvo).toBe(100);
  });

  test('Home com progresso: Continuar, cursos, para explorar e a lateral', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bom te ver de novo!' })).toBeVisible();
    await expect(
      page.getByText('Você está fazendo 2 cursos. Continue de onde parou.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seus cursos' })).toBeVisible();
    await expect(page.getByText('em destaque')).toHaveCount(1);
    await expect(page.getByText('30 / 50 XP')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Revisão de hoje' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Revisar agora' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Revisar.*6/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ofensiva' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cursos', exact: true })).toHaveCount(0);
    expect(await graves(page)).toEqual([]);
  });

  test('"Tudo em dia" mostra "Nada para revisar hoje"', async ({ page }) => {
    await carregar(page, 'Tudo em dia');
    await page.goto('/');
    await expect(page.getByText('Nada para revisar hoje')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Revisar agora' })).toHaveCount(0);
  });

  test('um curso só usa a variante com "Seu progresso no curso"', async ({ page }) => {
    await carregar(page, 'Um curso só');
    await page.goto('/');
    await expect(page.getByText('Continue de onde parou.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seu progresso no curso' })).toBeVisible();
    await expect(page.getByText('3 de 8 lições')).toBeVisible();
    await expect(page.getByText(/Outros cursos aparecem aqui/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seus cursos' })).toHaveCount(0);
  });

  test('"Curso 1 completo" mostra curso liberado e curso bloqueado em Para explorar', async ({
    page,
  }) => {
    await carregar(page, 'Curso 1 completo');
    await page.goto('/');
    const explorar = page.getByRole('region', { name: 'Para explorar' });
    await expect(explorar.getByRole('link', { name: 'Começar curso' })).toHaveCount(1);
    await expect(
      explorar.getByText(/Falt(a|am) \d+ conceitos? para liberar/).first(),
    ).toBeVisible();
    await expect(explorar.getByText(/Você aprende .* em “/).first()).toBeVisible();
  });

  test('a meta de hoje reabre a janela e salva a nova meta', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await page.getByRole('button', { name: /30 \/ 50 XP/ }).click();
    const janela = page.getByRole('dialog', { name: 'Quanto você quer estudar por dia?' });
    await expect(janela.getByRole('radio', { name: /Regular · 50 XP/ })).toBeChecked();
    await janela.getByRole('radio', { name: /Leve · 20 XP/ }).check();
    await janela.getByRole('button', { name: 'Salvar meta' }).click();
    await expect(page.getByText('30 / 20 XP')).toBeVisible();
    await page.reload();
    await expect(page.getByText('30 / 20 XP')).toBeVisible();
  });

  test('o botão Continuar abre a lição em andamento', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    await page.getByRole('link', { name: 'Continuar', exact: true }).first().click();
    await expect(page).toHaveURL(/\/c\/.+\/.+\/.+/);
    await expect(page.getByText(/Explicação · 1 de/)).toBeVisible();
  });

  test('página do curso: estados das lições, conceitos e o que libera', async ({ page }) => {
    await carregar(page, 'Um curso só');
    await page.goto('/c/comece-por-aqui');
    await expect(page.getByRole('heading', { name: 'Comece por aqui' })).toBeVisible();
    await expect(page.getByText('3 de 8 lições').first()).toBeVisible();
    await expect(page.getByText('Feita', { exact: true })).toHaveCount(3);
    await expect(page.getByText('Agora', { exact: true })).toHaveCount(1);
    await expect(page.getByText('Bloqueada', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Libera ao terminar a Unidade 2')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conceitos do curso' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O que este curso libera' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Aprofundamento lorem' })).toBeVisible();
    expect(await graves(page)).toEqual([]);

    // Lição bloqueada não navega.
    const bloqueada = page.getByRole('button', { name: /Bloqueada/ }).first();
    await bloqueada.focus();
    await expect(page.getByText('Termine a lição anterior para abrir esta.').first()).toBeVisible();
    await bloqueada.click({ force: true });
    await expect(page).toHaveURL(/\/c\/comece-por-aqui$/);

    await page.getByRole('link', { name: 'Continuar', exact: true }).first().click();
    await expect(page).toHaveURL(/lorem-unidade-dois\/lorem-licao-tres$/);
  });

  test('visitante na página do curso começa pela janela da meta', async ({ page }) => {
    await page.goto('/c/comece-por-aqui');
    await expect(page.getByText('0 de 8 lições').first()).toBeVisible();
    await page.getByRole('button', { name: 'Começar', exact: true }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('uma lição feita no fluxo completo aparece como "Continuar" na lição seguinte', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Começar agora' }).first().click();
    await page.getByRole('button', { name: 'Começar a primeira lição' }).click();
    await page.getByLabel('Sit amet consectetur').check();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Entendi' }).click();
      await page.getByLabel('Consectetur', { exact: true }).check();
      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    }
    await page.getByRole('button', { name: 'Começar prática' }).click();
    for (const certa of [
      '2',
      'Tempor incididunt',
      'Consectetur adipiscing',
      'Falso',
      'Verdadeiro',
      'Ipsum',
    ]) {
      await page.getByRole('radio', { name: certa, exact: true }).check();
      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    }
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page).toHaveURL(/lorem-licao-dois$/);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bom te ver de novo!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lorem lição dois' })).toBeVisible();
    await expect(page.getByText('60 / 50 XP')).toBeVisible();
    await expect(page.getByText('1 dia seguido', { exact: true })).toBeVisible();
  });

  test('o menu lateral tem ícones e a marca em minúsculas', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/');
    const menu = page.getByRole('navigation', { name: 'Principal' });
    await expect(menu.locator('a svg')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'democratiza' })).toBeVisible();
  });

  test('a Home com progresso ocupa a largura da tela em duas colunas', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/');
    const continuar = await page
      .getByRole('region', { name: 'Continuar de onde parou' })
      .boundingBox();
    const lateral = await page.getByRole('complementary', { name: 'Seu dia' }).boundingBox();
    expect(continuar?.width ?? 0).toBeGreaterThan(900);
    expect(lateral?.x ?? 0).toBeGreaterThan((continuar?.x ?? 0) + (continuar?.width ?? 0));
  });
});
