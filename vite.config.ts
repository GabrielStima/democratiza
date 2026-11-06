/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { conteudo } from './vite-plugins/conteudo.ts';

/** Cada lição vira um arquivo em `assets/licoes/`: o service worker só guarda as que foram abertas. */
const PASTA_DAS_LICOES = 'assets/licoes/';

export default defineConfig({
  plugins: [
    preact(),
    conteudo(),
    VitePWA({
      // A pessoa decide quando atualizar: o aviso "Nova versão disponível" chama o `updateSW`.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Democratiza',
        short_name: 'Democratiza',
        description:
          'Entenda a política do Brasil em 5 minutos por dia. Gratuito, apartidário e com fonte em tudo.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#12A150',
        background_color: '#FFFFFF',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // O app, o catálogo (já dentro do JS), as fontes e as imagens ficam guardados na instalação.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
        globIgnores: [`${PASTA_DAS_LICOES}**`],
        // Qualquer endereço do app abre o mesmo index.html (o roteador decide a tela).
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Na primeira visita o service worker já assume a página, para guardar as lições abertas dali em diante.
        clientsClaim: true,
        runtimeCaching: [
          {
            // Lição aberta uma vez fica disponível sem internet; o nome do arquivo tem hash.
            // Expressão literal: o Workbox copia isto para dentro do service worker.
            urlPattern: /\/assets\/licoes\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'licoes',
              expiration: { maxEntries: 200 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) =>
          chunk.facadeModuleId?.includes('virtual:democratiza/licao/')
            ? `${PASTA_DAS_LICOES}[name]-[hash].js`
            : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'vite-plugins/**/*.test.ts'],
    globals: false,
    setupFiles: ['src/testes/setup.ts'],
  },
});
