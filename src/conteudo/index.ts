import bibliografia from 'virtual:democratiza/bibliografia';
import catalogo from 'virtual:democratiza/catalogo';
import { carregadores } from 'virtual:democratiza/licoes';
import type { Licao } from '../content-schema/licao';

export { bibliografia, catalogo };

/** Baixa o arquivo de uma lição (só quando a pessoa a abre). Devolve null se não existir. */
export async function carregarLicao(
  curso: string,
  unidade: string,
  licao: string,
): Promise<Licao | null> {
  const carregar = carregadores[`${curso}/${unidade}/${licao}`];
  return carregar ? (await carregar()).default : null;
}
