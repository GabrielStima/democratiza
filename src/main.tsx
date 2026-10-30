import { render } from 'preact';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource-variable/nunito/wght.css';
import '../styles/global.css';
import { Aplicacao } from './app';
import { iniciarStores } from './stores/index.ts';

async function iniciar() {
  // O relógio simulado do /_dev só existe em dev e prévias.
  if (import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_RASCUNHOS === '1') {
    (await import('./dev/relogioDev.ts')).iniciarRelogioDev();
  }
  await iniciarStores();
  const raiz = document.getElementById('app');
  if (raiz) render(<Aplicacao />, raiz);
}

void iniciar();
