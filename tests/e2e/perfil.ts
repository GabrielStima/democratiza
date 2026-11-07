import { expect, type Page } from '@playwright/test';

/**
 * Clica em "Carregar perfil" no /_dev e espera o estado e o caderno estarem gravados.
 * Sem a espera, um `page.goto` logo depois pode interromper a gravação do caderno.
 */
export async function clicarPerfil(page: Page, nome: string): Promise<void> {
  await page.getByRole('button', { name: `Carregar perfil: ${nome}` }).click();
  await expect(page.getByTestId('fatos')).toHaveAttribute('data-perfil-gravado', nome);
}
