import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

const estadoSalvo = (page: Page) => page.evaluate(() => localStorage.getItem('democratiza:v1'));

async function carregar(page: Page, perfil: string) {
  await page.goto('/_dev');
  await page.getByRole('button', { name: `Carregar perfil: ${perfil}` }).click();
  await expect(page.getByTestId('fatos')).toBeVisible();
}

const TELAS = [
  { nome: 'desktop', tamanho: { width: 1280, height: 800 } },
  { nome: 'celular (390 px)', tamanho: { width: 390, height: 844 } },
];

for (const tela of TELAS) {
  test.describe(tela.nome, () => {
    test.use({ viewport: tela.tamanho, hasTouch: tela.tamanho.width < 1024 });
    // O Chromium de teste não decide se tem compartilhamento: sem ele, o backup sempre baixa.
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
        Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
      });
    });

    test('Sobre: princípios, método, dados e bibliografia, sem problema sério de acessibilidade', async ({
      page,
    }) => {
      await page.goto('/sobre');
      await expect(
        page.getByRole('heading', { name: 'Sobre o Democratiza', level: 1 }),
      ).toBeVisible();
      for (const nome of ['Nossos princípios', 'Como ensinamos', 'Seus dados', 'Bibliografia']) {
        await expect(page.getByRole('heading', { name: nome })).toBeVisible();
      }
      await expect(page.getByText('Seus dados são seus')).toBeVisible();
      await expect(page.getByText('5. Caderno e revisão')).toBeVisible();
      // Sem progresso não há o que salvar nem apagar; abrir um backup continua possível.
      await expect(page.getByRole('button', { name: 'Salvar backup' })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Apagar meu progresso' })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Abrir backup' })).toBeEnabled();
      expect(await graves(page)).toEqual([]);
    });

    test('arquivo inválido mostra o aviso e não altera nada', async ({ page }) => {
      await page.goto('/sobre');
      await page.locator('input[type=file]').setInputFiles({
        name: 'invalido.json',
        mimeType: 'application/json',
        buffer: Buffer.from('isto não é um backup'),
      });
      const janela = page.getByRole('dialog', { name: 'Não foi possível abrir o arquivo' });
      await expect(janela).toBeVisible();
      await expect(janela.getByText('Seu progresso atual não foi alterado.')).toBeVisible();
      expect(await graves(page)).toEqual([]);
      await janela.getByRole('button', { name: 'Entendi' }).click();
      await expect(janela).toHaveCount(0);
      expect(await estadoSalvo(page)).toBeNull();
    });

    test.describe('com rascunhos ligados', () => {
      test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');

      test('salvar, apagar e abrir o backup devolve exatamente o mesmo progresso', async ({
        page,
      }, info) => {
        await carregar(page, 'Em andamento');
        const antes = await estadoSalvo(page);
        await page.goto('/caderno');
        const conceitos = await page
          .getByText(/conceitos aprendidos/)
          .first()
          .textContent();

        await page.goto('/sobre');
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.getByRole('button', { name: 'Salvar backup' }).click(),
        ]);
        expect(download.suggestedFilename()).toMatch(
          /^democratiza-backup-\d{4}-\d{2}-\d{2}\.json$/,
        );
        const caminho = info.outputPath('backup.json');
        await download.saveAs(caminho);
        await expect(
          page.getByText('Backup salvo. Guarde o arquivo em um lugar seguro.'),
        ).toBeVisible();

        // Apagar: a janela avisa e Cancelar não muda nada.
        await page.getByRole('button', { name: 'Apagar meu progresso' }).click();
        const apagar = page.getByRole('dialog', { name: 'Apagar todo o seu progresso?' });
        await expect(apagar.getByText('Não dá para desfazer.')).toBeVisible();
        expect(await graves(page)).toEqual([]);
        await apagar.getByRole('button', { name: 'Cancelar' }).click();
        expect(await estadoSalvo(page)).toBe(antes);

        await page.getByRole('button', { name: 'Apagar meu progresso' }).click();
        await page.getByRole('button', { name: 'Apagar tudo' }).click();
        await expect(
          page.getByText('Progresso apagado. Você pode recomeçar quando quiser.'),
        ).toBeVisible();
        expect(await estadoSalvo(page)).toBeNull();
        await page.goto('/');
        await expect(
          page.getByRole('heading', { name: /Entenda a política do Brasil/ }),
        ).toBeVisible();

        // Abrir o backup de volta.
        await page.goto('/sobre');
        await page.locator('input[type=file]').setInputFiles({
          name: download.suggestedFilename(),
          mimeType: 'application/json',
          buffer: readFileSync(caminho),
        });
        const trocar = page.getByRole('dialog', { name: 'Substituir o seu progresso?' });
        await expect(trocar.getByText(/democratiza-backup-.*\.json/)).toBeVisible();
        await expect(trocar.getByText(/conceitos? e \d+ cursos?/)).toBeVisible();
        await trocar.getByRole('button', { name: 'Substituir' }).click();
        await expect(page.getByText('Progresso restaurado.')).toBeVisible();

        expect(await estadoSalvo(page)).toBe(antes);
        await page.goto('/caderno');
        await expect(page.getByText(/conceitos aprendidos/).first()).toHaveText(conceitos ?? '');
      });

      test('Esc fecha as janelas e "Salvar backup antes" baixa o arquivo', async ({ page }) => {
        await carregar(page, 'Tudo em dia');
        await page.goto('/sobre');
        await page.getByRole('button', { name: 'Apagar meu progresso' }).click();
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.getByRole('button', { name: 'Salvar backup antes' }).click(),
        ]);
        expect(readFileSync(await download.path(), 'utf8')).toContain('"app": "democratiza"');
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        expect(await estadoSalvo(page)).not.toBeNull();
      });

      test('a bibliografia junta as fontes em ordem alfabética', async ({ page }) => {
        await page.goto('/sobre');
        await expect(page.getByRole('heading', { name: 'Bibliografia' })).toBeVisible();
        const itens = await page
          .locator('section[aria-labelledby="bibliografia"] li')
          .allTextContents();
        expect(itens.length).toBeGreaterThan(0);
        expect(itens.every((t) => /usada em \d+ liç(ão|ões)/.test(t))).toBe(true);
        const nomes = itens.map((t) => t.replace(/\s*usada em.*$/, ''));
        expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')));
      });
    });

    if (tela.tamanho.width < 1024) {
      test('Sobre no celular: botões em largura total e sem rolagem lateral', async ({ page }) => {
        await page.goto('/sobre');
        for (const nome of ['Salvar backup', 'Abrir backup', 'Apagar meu progresso']) {
          const caixa = await page.getByRole('button', { name: nome }).boundingBox();
          expect(Math.round(caixa!.width)).toBe(390 - 32);
          expect(caixa!.height).toBeGreaterThanOrEqual(44);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
      });

      test('as janelas de confirmação são folhas de baixo com botões em largura total', async ({
        page,
      }) => {
        test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');
        await carregar(page, 'Em andamento');
        await page.goto('/sobre');
        await page.getByRole('button', { name: 'Apagar meu progresso' }).click();
        const janela = page.getByRole('dialog', { name: 'Apagar todo o seu progresso?' });
        await expect(janela).toBeVisible();
        await page.waitForTimeout(300);
        const b = await janela.boundingBox();
        expect(Math.round(b!.y + b!.height)).toBe(844);
        expect(Math.round(b!.width)).toBe(390);
        const apagar = await janela.getByRole('button', { name: 'Apagar tudo' }).boundingBox();
        expect(Math.round(apagar!.width)).toBeGreaterThanOrEqual(390 - 48);
      });

      test('Salvar backup usa o compartilhamento do aparelho quando ele existe', async ({
        page,
      }) => {
        test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'os perfis só existem no /_dev');
        await carregar(page, 'Em andamento');
        await page.addInitScript(() => {
          const w = window as unknown as { __partilhados: string[] };
          w.__partilhados = [];
          Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
          Object.defineProperty(navigator, 'share', {
            configurable: true,
            value: async (d: ShareData) => {
              w.__partilhados.push(d.files?.[0]?.name ?? '');
            },
          });
        });
        await page.goto('/sobre');
        await page.getByRole('button', { name: 'Salvar backup' }).click();
        await expect(
          page.getByText('Backup salvo. Guarde o arquivo em um lugar seguro.'),
        ).toBeVisible();
        const nomes = await page.evaluate(
          () => (window as unknown as { __partilhados: string[] }).__partilhados,
        );
        expect(nomes).toHaveLength(1);
        expect(nomes[0]).toMatch(/^democratiza-backup-\d{4}-\d{2}-\d{2}\.json$/);
      });
    }
  });
}
