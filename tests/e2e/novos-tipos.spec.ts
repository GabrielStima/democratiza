import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { clicarPerfil } from './perfil';

const LICAO = '/c/aprofundamento-lorem/lorem-aprofundamento-um/lorem-licao-modelo-dois';

const graves = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

async function carregar(page: Page, perfil: string) {
  await page.goto('/_dev');
  await clicarPerfil(page, perfil);
}

/** Da Situação até a primeira pergunta da Prática. */
async function ateAPratica(page: Page) {
  await page.goto(LICAO);
  await page.getByLabel('Sit amet consectetur').check();
  await page.getByRole('button', { name: 'Ver explicação' }).click();
  for (let card = 0; card < 2; card++) {
    await page.getByRole('button', { name: 'Entendi' }).click();
    await page.getByLabel('Consectetur', { exact: true }).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await page.getByRole('button', { name: 'Começar prática' }).click();
}

async function responderOpcoes(page: Page, certas: number[]) {
  for (const i of certas) {
    await page.getByRole('radio').nth(i).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
}

/** Ao trocar de pergunta o app leva o foco ao conteúdo novo; só depois o teclado é da pessoa. */
async function aguardarFocoNaPergunta(page: Page) {
  await expect(page.locator('main [tabindex="-1"]').first()).toBeFocused();
}

/** Coloca cada item na categoria dada, só com foco e teclado (Enter). */
async function classificarPorTeclado(page: Page, destino: Record<string, string>) {
  for (const [item, categoria] of Object.entries(destino)) {
    const botao = page
      .getByRole('group', { name: 'Itens ainda sem categoria' })
      .getByRole('button', {
        name: item,
        exact: true,
      });
    await botao.focus();
    await page.keyboard.press('Enter');
    const colocar = page.getByRole('button', { name: `Colocar “${item}” aqui` });
    await colocar.nth(categoria === 'Lorem' ? 0 : 1).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(`“${item}” colocado em ${categoria}.`)).toBeVisible();
  }
}

/** Sobe cada etapa até a ordem certa, usando os botões de seta. */
async function ordenarCerto(page: Page, certa: string[]) {
  for (let pos = 0; pos < certa.length; pos++) {
    const alvo = certa[pos] as string;
    for (let tentativas = 0; tentativas < 10; tentativas++) {
      const textos = await page
        .getByRole('list', { name: 'Etapas para ordenar' })
        .locator('li > span:nth-child(2)')
        .allTextContents();
      if (textos[pos] === alvo) break;
      await page.getByRole('button', { name: `Subir: ${alvo}` }).click();
    }
  }
}

test.describe('tipos novos de exercício (com rascunhos ligados)', () => {
  test.skip(process.env.VITE_MOSTRAR_RASCUNHOS !== '1', 'o conteúdo Lorem só existe com rascunhos');

  test('classificar: só verifica com tudo colocado e dá para trocar de ideia', async ({ page }) => {
    await carregar(page, 'Curso 1 completo');
    await ateAPratica(page);
    await responderOpcoes(page, [1, 2, 0]);
    await expect(page.getByText(/Classificar · 4 de 6/)).toBeVisible();
    const verificar = page.getByRole('button', { name: 'Verificar' });
    await expect(verificar).toBeDisabled();
    expect(await graves(page)).toEqual([]);

    await aguardarFocoNaPergunta(page);
    await classificarPorTeclado(page, { 'Item um': 'Lorem', 'Item dois': 'Lorem' });
    await expect(verificar).toBeDisabled();
    // Trocar de ideia: tocar no item já colocado o devolve.
    await page
      .getByRole('list', { name: 'Itens em Lorem' })
      .getByRole('button', { name: /Item dois/ })
      .click();
    await expect(
      page
        .getByRole('group', { name: 'Itens ainda sem categoria' })
        .getByRole('button', { name: 'Item dois' }),
    ).toBeVisible();

    await classificarPorTeclado(page, {
      'Item dois': 'Ipsum',
      'Item três': 'Lorem',
      'Item quatro': 'Ipsum',
    });
    await expect(page.getByText('Todos colocados.')).toBeVisible();
    await expect(verificar).toBeEnabled();
    await verificar.click();
    await expect(page.getByText(/Isso mesmo! \+10 XP/)).toBeVisible();
    await expect(page.getByText('Certo', { exact: true })).toHaveCount(4);
    expect(await graves(page)).toEqual([]);
  });

  test('tudo certo na lição nova rende XP e erros aparecem em "Rever o que errei"', async ({
    page,
  }) => {
    await carregar(page, 'Curso 1 completo');
    await ateAPratica(page);
    await responderOpcoes(page, [1, 2, 0]);

    // Classificar errado: tudo no mesmo lugar.
    await aguardarFocoNaPergunta(page);
    await classificarPorTeclado(page, {
      'Item um': 'Ipsum',
      'Item dois': 'Lorem',
      'Item três': 'Ipsum',
      'Item quatro': 'Lorem',
    });
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Quase! Veja onde cada item fica')).toBeVisible();
    await expect(page.getByText(/^Era em Lorem$/i).first()).toBeVisible();
    await expect(page.getByText('Essa pergunta volta na sua revisão.')).toBeVisible();
    expect(await graves(page)).toEqual([]);
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Ordenar: a ordem de partida nunca é a certa; os extremos têm o botão desativado.
    await expect(page.getByText(/Ordenar · 5 de/)).toBeVisible();
    const lista = page.getByRole('list', { name: 'Etapas para ordenar' });
    await expect(lista.getByRole('button', { name: /^Subir:/ }).first()).toBeDisabled();
    await expect(lista.getByRole('button', { name: /^Descer:/ }).last()).toBeDisabled();
    expect(await graves(page)).toEqual([]);
    await ordenarCerto(page, [
      'Primeira etapa lorem',
      'Segunda etapa ipsum',
      'Terceira etapa dolor',
      'Quarta etapa sit amet',
    ]);
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText(/Isso mesmo!/)).toBeVisible();
    await expect(lista.getByRole('button')).toHaveCount(0);
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Mito ou fato: errar mostra "Era mito"; a frase vem num balão.
    await expect(page.getByText('Uma frase que circula por aí')).toBeVisible();
    await page.getByLabel('Fato').check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText('Era mito')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Os exercícios errados voltam uma vez no fim: classificar (certo agora) e mito.
    await expect(page.getByText(/Classificar · 7 de 8/)).toBeVisible();
    await aguardarFocoNaPergunta(page);
    await classificarPorTeclado(page, {
      'Item um': 'Lorem',
      'Item dois': 'Ipsum',
      'Item três': 'Lorem',
      'Item quatro': 'Ipsum',
    });
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText(/Isso mesmo! \+5 XP/)).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Mito', { exact: true }).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByText(/Isso mesmo, é mito! \+5 XP/)).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Lição concluída!' })).toBeVisible();
    await page.getByRole('button', { name: 'Rever o que errei' }).click();
    await expect(page.getByText(/Item um → Ipsum/)).toBeVisible();
    await expect(page.getByText(/Item um → Lorem/)).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });

  test('ordenar: o foco acompanha a etapa que foi movida pelo teclado', async ({ page }) => {
    await carregar(page, 'Curso 1 completo');
    await ateAPratica(page);
    await responderOpcoes(page, [1, 2, 0]);
    await aguardarFocoNaPergunta(page);
    await classificarPorTeclado(page, {
      'Item um': 'Lorem',
      'Item dois': 'Ipsum',
      'Item três': 'Lorem',
      'Item quatro': 'Ipsum',
    });
    await page.getByRole('button', { name: 'Verificar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Ao trocar de pergunta o app leva o foco ao conteúdo novo; só depois o teclado é da pessoa.
    await expect(page.locator('main [tabindex="-1"]').first()).toBeFocused();
    const lista = page.getByRole('list', { name: 'Etapas para ordenar' });
    const ultima = lista.getByRole('listitem').last();
    const nome = (await ultima.locator('span').nth(1).textContent()) ?? '';
    const subir = lista.getByRole('button', { name: `Subir: ${nome}` });
    await subir.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(new RegExp(`“${nome}” agora é a 3ª de 4`))).toBeVisible();
    await expect(subir).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(subir).toBeFocused();
    await expect(page.getByText(new RegExp(`“${nome}” agora é a 2ª de 4`))).toBeVisible();
  });

  test('praticar um conceito usa os tipos novos na mesma sessão da Revisão', async ({ page }) => {
    await carregar(page, 'Em andamento');
    await page.goto('/caderno/praticar/lorem-14');
    const vistos = new Set<string>();
    for (let n = 0; n < 5; n++) {
      const kicker =
        (await page
          .locator('p', { hasText: / · \d+ de \d+$/ })
          .first()
          .textContent()) ?? '';
      vistos.add(kicker.split(' · ')[0] ?? '');
      if (kicker.startsWith('Classificar')) {
        await aguardarFocoNaPergunta(page);
        await classificarPorTeclado(page, {
          'Item um': 'Lorem',
          'Item dois': 'Ipsum',
          'Item três': 'Lorem',
          'Item quatro': 'Ipsum',
        });
      } else if (kicker.startsWith('Ordenar')) {
        await ordenarCerto(page, [
          'Primeira etapa lorem',
          'Segunda etapa ipsum',
          'Terceira etapa dolor',
          'Quarta etapa sit amet',
        ]);
      } else {
        await page.getByRole('radio').first().check();
      }
      await page.getByRole('button', { name: 'Verificar' }).click();
      await page.getByRole('button', { name: 'Continuar' }).click();
    }
    expect([...vistos]).toEqual(expect.arrayContaining(['Classificar', 'Mito ou fato?']));
    await expect(
      page.getByRole('heading', { name: /Praticar|concluíd|Revisão/i }).first(),
    ).toBeVisible();
  });
});
