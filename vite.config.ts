/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { conteudo } from './vite-plugins/conteudo.ts';

export default defineConfig({
  plugins: [preact(), conteudo()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    globals: false,
    setupFiles: ['src/testes/setup.ts'],
  },
});
