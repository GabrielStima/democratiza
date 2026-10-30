import { join, resolve } from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { construirConteudo } from '../src/content-schema/construir.ts';
import { formatarErros } from '../src/content-schema/formatar.ts';
import type { ResultadoConteudo } from '../src/content-schema/tipos.ts';
import { lerPasta } from './leitor.ts';

const PREFIXO = 'virtual:democratiza/';
const RESOLVIDO = '\0' + PREFIXO;

/**
 * Lê content/, valida tudo e entrega o resultado como módulos virtuais:
 *  - virtual:democratiza/catalogo      catálogo leve (cursos, unidades, lições, conceitos)
 *  - virtual:democratiza/bibliografia  fontes únicas
 *  - virtual:democratiza/licoes        carregadores, um por lição
 *  - virtual:democratiza/licao/<c>/<u>/<l>  uma lição (arquivo separado no build)
 * No build, qualquer erro de conteúdo para tudo. No dev, os erros vão para o catálogo.
 */
export function conteudo(): Plugin {
  let raizContent = '';
  let mostrarRascunhos = false;
  let emBuild = false;
  let cache: (ResultadoConteudo & { erros: ReturnType<typeof construirConteudo>['erros'] }) | null =
    null;

  const calcular = () => {
    cache ??= construirConteudo(lerPasta(raizContent), { mostrarRascunhos });
    return cache;
  };

  return {
    name: 'democratiza-conteudo',

    configResolved(config) {
      raizContent = join(config.root, 'content');
      emBuild = config.command === 'build';
      const env = loadEnv(config.mode, config.root, 'VITE_');
      const valor = process.env.VITE_MOSTRAR_RASCUNHOS ?? env.VITE_MOSTRAR_RASCUNHOS;
      mostrarRascunhos = valor === '1' || config.command === 'serve';
    },

    buildStart() {
      cache = null;
      const r = calcular();
      if (emBuild && r.erros.length > 0) {
        this.error(`Conteúdo inválido:\n\n${formatarErros(r.erros)}\n`);
      }
    },

    configureServer(server) {
      const r = calcular();
      if (r.erros.length > 0) server.config.logger.error(`\n${formatarErros(r.erros)}\n`);
      server.watcher.add(raizContent);
      const aoMudar = (arquivo: string) => {
        if (!resolve(arquivo).startsWith(raizContent)) return;
        cache = null;
        const novo = calcular();
        if (novo.erros.length > 0) server.config.logger.error(`\n${formatarErros(novo.erros)}\n`);
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', aoMudar);
      server.watcher.on('change', aoMudar);
      server.watcher.on('unlink', aoMudar);
    },

    resolveId(id) {
      return id.startsWith(PREFIXO) ? '\0' + id : null;
    },

    load(id) {
      if (!id.startsWith(RESOLVIDO)) return null;
      const nome = id.slice(RESOLVIDO.length);
      const r = calcular();
      if (nome === 'catalogo') return `export default ${JSON.stringify(r.catalogo)};`;
      if (nome === 'bibliografia') return `export default ${JSON.stringify(r.bibliografia)};`;
      if (nome === 'licoes') {
        const linhas = Object.keys(r.licoes).map(
          (k) => `  ${JSON.stringify(k)}: () => import(${JSON.stringify(PREFIXO + 'licao/' + k)}),`,
        );
        return `export const carregadores = {\n${linhas.join('\n')}\n};`;
      }
      if (nome.startsWith('licao/')) {
        const licao = r.licoes[nome.slice('licao/'.length)];
        if (!licao) return this.error(`Lição não encontrada: ${nome}`);
        return `export default ${JSON.stringify(licao)};`;
      }
      return null;
    },
  };
}
