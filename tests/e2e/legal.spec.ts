import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const TELAS = [
  { nome: 'desktop', tamanho: { width: 1280, height: 800 } },
  { nome: 'celular (390 px)', tamanho: { width: 390, height: 844 } },
];

const PAGINAS = [
  { rota: '/privacidade', titulo: 'Política de privacidade', trecho: /sem usar cookies/ },
  { rota: '/termos', titulo: 'Termos de uso', trecho: /cursos livres/i },
];

for (const tela of TELAS) {
  test.describe(`M16 · páginas legais · ${tela.nome}`, () => {
    test.use({ viewport: tela.tamanho, hasTouch: tela.tamanho.width < 1024 });

    for (const p of PAGINAS) {
      test(`${p.rota} abre, tem data, não rola de lado e passa no axe`, async ({ page }) => {
        await page.goto(p.rota);
        await expect(page.getByRole('heading', { name: p.titulo, level: 1 })).toBeVisible();
        await expect(page.getByText(p.trecho).first()).toBeVisible();
        await expect(page.getByText('Última atualização:')).toBeVisible();
        expect(await semRolagemLateral(page)).toBe(true);
        expect(await graves(page)).toEqual([]);
      });
    }

    test('o rodapé leva à Privacidade, aos Termos e às Licenças', async ({ page }) => {
      await page.goto('/');
      const rodape = page.getByRole('navigation', { name: 'Rodapé' });
      await expect(page.getByText('Conteúdo sob CC BY-NC-SA 4.0 · Código sob MIT')).toBeVisible();
      await rodape.getByRole('link', { name: 'Privacidade' }).click();
      await expect(page).toHaveURL(/\/privacidade$/);
      await expect(
        page.getByRole('heading', { name: 'Política de privacidade', level: 1 }),
      ).toBeVisible();
      await page
        .getByRole('navigation', { name: 'Rodapé' })
        .getByRole('link', { name: 'Licenças' })
        .click();
      await expect(page).toHaveURL(/\/termos#licencas$/);
      await expect(page.getByRole('heading', { name: 'Licenças', level: 2 })).toBeInViewport();
    });

    test('o Sobre tem "Como escrevemos" e os links das páginas legais', async ({ page }) => {
      await page.goto('/sobre#como-escrevemos');
      await expect(
        page.getByRole('heading', { name: 'Como escrevemos', level: 2 }),
      ).toBeInViewport();
      await expect(page.getByText('escritos com apoio de inteligência artificial')).toBeVisible();
      const legais = page.getByRole('navigation', { name: 'Páginas legais' }).last();
      await legais.getByRole('link', { name: 'Termos de uso' }).click();
      await expect(page).toHaveURL(/\/termos$/);
    });
  });
}

test.describe('M16 · com perfis de demonstração', () => {
  test.skip(
    process.env.VITE_MOSTRAR_RASCUNHOS !== '1',
    'os perfis e a lição Lorem só existem em rascunho',
  );

  test('menu lateral (desktop) leva às páginas legais', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/_dev');
    await page.getByRole('button', { name: 'Carregar perfil: Em andamento' }).click();
    await page.goto('/sobre');
    const legais = page
      .getByRole('complementary')
      .getByRole('navigation', { name: 'Páginas legais' });
    await legais.getByRole('link', { name: 'Termos' }).click();
    await expect(page).toHaveURL(/\/termos$/);
  });

  test('cada explicação tem "Como este conteúdo é feito", que abre o Sobre', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    await page.getByRole('link', { name: 'Como este conteúdo é feito' }).click();
    await expect(page).toHaveURL(/\/sobre#como-escrevemos$/);
    await expect(page.getByRole('heading', { name: 'Como escrevemos', level: 2 })).toBeInViewport();
  });

  test('"Encontrou um erro?" usa o modelo de issue com o aviso de relato público', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Ver explicação' }).click();
    const href = await page.getByRole('link', { name: 'Encontrou um erro?' }).getAttribute('href');
    expect(href).toContain('template=erro-no-conteudo.yml');
  });
});
