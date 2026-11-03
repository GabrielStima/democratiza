import { expect, test, type Page } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

const LICAO = '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';
const OUTRA_LICAO = '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-dois';

/** Espera o service worker instalar e assumir a página. */
async function esperarServiceWorker(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}

test('o manifesto descreve o app e o Chrome o considera instalável', async ({ page }) => {
  await page.goto('/');
  await esperarServiceWorker(page);
  const resposta = await page.request.get('/manifest.webmanifest');
  const m = (await resposta.json()) as {
    name: string;
    short_name: string;
    lang: string;
    display: string;
    start_url: string;
    theme_color: string;
    icons: { sizes: string; purpose?: string }[];
  };
  expect(m).toMatchObject({
    name: 'Democratiza',
    short_name: 'Democratiza',
    lang: 'pt-BR',
    display: 'standalone',
    start_url: '/',
    theme_color: '#12A150',
  });
  expect(m.icons.map((i) => `${i.sizes}:${i.purpose ?? 'any'}`)).toEqual([
    '192x192:any',
    '512x512:any',
    '512x512:maskable',
  ]);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = (await cdp.send('Page.getInstallabilityErrors')) as {
    installabilityErrors: { errorId: string }[];
  };
  // O navegador de teste roda em janela anônima, onde instalar nunca é possível: é o único erro aceito.
  expect(installabilityErrors.map((e) => e.errorId).filter((id) => id !== 'in-incognito')).toEqual(
    [],
  );
});

test('avisa que já funciona sem internet e a Home abre sem rede', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByText('Pronto: o Democratiza já funciona sem internet.')).toBeVisible();
  await esperarServiceWorker(page);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Entenda a política do Brasil/ })).toBeVisible();
  // Qualquer endereço do app abre (o roteador decide a tela), até o 404.
  await page.goto('/endereco-que-nao-existe');
  await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toBeVisible();
  await context.setOffline(false);
});

test.describe('lições offline (com rascunhos ligados)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('uma lição já aberta abre sem internet; as outras avisam em vez de dar 404', async ({
    page,
    context,
  }) => {
    // Primeiro a visita normal, que instala o service worker; depois a lição passa por ele.
    await page.goto('/');
    await esperarServiceWorker(page);
    await page.goto(LICAO);
    await expect(page.getByRole('heading', { name: /Primeiro, uma situação/ })).toBeVisible();
    // Garante que o arquivo da lição já foi guardado no cache de lições.
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const cache = await caches.open('licoes');
          return (await cache.keys()).length;
        }),
      )
      .toBeGreaterThan(0);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: /Primeiro, uma situação/ })).toBeVisible();

    await page.goto(OUTRA_LICAO);
    await expect(
      page.getByRole('heading', { name: 'Não foi possível abrir a lição' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Essa página não existe' })).toHaveCount(0);

    // De volta à internet, "Tentar de novo" abre a lição.
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Tentar de novo' }).click();
    await expect(page.getByRole('heading', { name: /Primeiro, uma situação/ })).toBeVisible();
  });
});
