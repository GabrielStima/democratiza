import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const MODELO = '/c/comece-por-aqui/lorem-unidade-um/lorem-licao-modelo';

test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

/** Da Situação até o primeiro exercício da Prática. */
async function ateAPratica(page: Page) {
  await page.goto(MODELO);
  await page.getByLabel('Sit amet consectetur').check();
  await page.getByRole('button', { name: 'Ver explicação' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Começar prática' }).click();
}

async function responder(page: Page, opcao: string) {
  await page.getByRole('radio', { name: opcao, exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
}

async function dadosSalvos(page: Page) {
  return page.evaluate(() => {
    const bruto = localStorage.getItem('democratiza:v1');
    return bruto
      ? (JSON.parse(bruto) as {
          xp: number;
          licoesConcluidas: Record<string, { acertos: number; total: number }>;
        })
      : null;
  });
}

const CERTAS = ['2', 'Tempor incididunt', 'Consectetur adipiscing', 'Falso', 'Verdadeiro', 'Ipsum'];

test('lição completa com 1 erro: 55 XP, 5 de 6 e três conceitos no caderno', async ({ page }) => {
  await ateAPratica(page);

  await responder(page, CERTAS[0] as string);
  await expect(page.getByText('Mandou bem! +10 XP')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await responder(page, CERTAS[1] as string);
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Erra a terceira: o rodapé avisa e a pergunta volta no fim.
  await expect(page.getByText(/3 de 6/)).toBeVisible();
  await responder(page, 'Sed do eiusmod');
  await expect(page.getByText('Resposta certa: Consectetur adipiscing')).toBeVisible();
  await expect(page.getByText('Essa pergunta volta na sua revisão.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  for (const certa of CERTAS.slice(3)) {
    await responder(page, certa);
    await page.getByRole('button', { name: 'Continuar' }).click();
  }

  // A pergunta errada volta uma vez, vale +5 e o contador cresce para 7.
  await expect(page.getByText(/7 de 7/)).toBeVisible();
  await responder(page, 'Consectetur adipiscing');
  await expect(page.getByText('Mandou bem! +5 XP')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page.getByRole('heading', { name: 'Lição concluída!' })).toBeVisible();
  const graves = async () =>
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
  expect(await graves()).toEqual([]);
  const numeros = page.getByRole('list').filter({ hasText: 'XP ganho' });
  await expect(numeros).toContainText('55');
  await expect(numeros).toContainText('5 de 6');
  await expect(page.getByText('3 conceitos novos no seu caderno')).toBeVisible();
  await expect(page.getByText('Volta para revisão amanhã').first()).toBeVisible();
  const salvo = await dadosSalvos(page);
  expect(salvo?.xp).toBe(55);
  expect(
    salvo?.licoesConcluidas['comece-por-aqui/lorem-unidade-um/lorem-licao-modelo'],
  ).toMatchObject({
    acertos: 5,
    total: 6,
  });

  // Rever o que errei: só leitura.
  await page.getByRole('button', { name: 'Rever o que errei' }).click();
  await expect(page.getByRole('heading', { name: 'O que você errou' })).toBeVisible();
  await expect(page.getByText('Sem pontos aqui')).toBeVisible();
  await expect(page.getByText('Você marcou')).toBeVisible();
  expect(await graves()).toEqual([]);
  await page.getByRole('button', { name: 'Voltar ao resultado' }).click();
  expect((await dadosSalvos(page))?.xp).toBe(55);

  // Refazer: sem XP e com o aviso.
  await page.goto(MODELO);
  await page.getByLabel('Sit amet consectetur').check();
  await page.getByRole('button', { name: 'Ver explicação' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByLabel('Consectetur', { exact: true }).check();
  await page.getByRole('button', { name: 'Verificar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Começar prática' }).click();
  for (const certa of CERTAS) {
    await responder(page, certa);
    await expect(page.getByText('Mandou bem!', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page.getByText('Lição refeita. O XP só conta na primeira vez.')).toBeVisible();
  await expect(page.getByRole('list').filter({ hasText: 'XP ganho' })).toContainText('0');
  expect((await dadosSalvos(page))?.xp).toBe(55);

  // Continuar leva à próxima lição do curso.
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page).toHaveURL(/lorem-licao-dois$/);
});

test('sair no meio da Prática e voltar retoma na pergunta certa', async ({ page }) => {
  await page.goto('/_dev');
  await page.getByRole('button', { name: 'Carregar perfil: Um curso só' }).click();
  await ateAPratica(page);
  await responder(page, CERTAS[0] as string);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await responder(page, 'Consectetur adipiscing'); // errada
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(/3 de 7/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/3 de 7/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verificar' })).toBeDisabled();
});

test('Rever explicação não muda a pergunta, a resposta nem o XP', async ({ page }) => {
  await ateAPratica(page);
  await page.getByRole('radio', { name: '2', exact: true }).check();
  await page.getByRole('button', { name: 'Rever explicação' }).click();
  const janela = page.getByRole('dialog', { name: 'Rever explicação' });
  await expect(janela).toContainText('Rever explicação · 1 de 2');
  await janela.getByRole('button', { name: 'Próximo' }).click();
  await expect(janela).toContainText('Rever explicação · 2 de 2');
  await expect(janela).toContainText('Aqui não vale ponto');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('radio', { name: '2', exact: true })).toBeChecked();
  await expect(page.getByText(/1 de 6/)).toBeVisible();
  expect(await dadosSalvos(page)).toBeNull();
});

test('verdadeiro ou falso mostra duas opções grandes', async ({ page }) => {
  await ateAPratica(page);
  for (const certa of CERTAS.slice(0, 3)) {
    await responder(page, certa);
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page.getByRole('radio', { name: 'Verdadeiro', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Falso', exact: true })).toBeVisible();
});

test('as telas da Prática não têm problema sério de acessibilidade', async ({ page }) => {
  await ateAPratica(page);
  const graves = async () =>
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
  expect(await graves()).toEqual([]);
  await responder(page, '1'); // errada
  expect(await graves()).toEqual([]);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await responder(page, 'Tempor incididunt'); // errada de novo na ordem seguinte? (certa)
  expect(await graves()).toEqual([]);
});
