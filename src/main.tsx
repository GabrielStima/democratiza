import { render } from 'preact';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource-variable/nunito/wght.css';
import '../styles/global.css';
import { Aplicacao } from './app';

const raiz = document.getElementById('app');
if (raiz) render(<Aplicacao />, raiz);
