import { useState } from 'preact/hooks';
import { formatarErros } from '../content-schema/formatar.ts';
import estilos from './ErrosConteudo.module.css';
import { catalogo } from './index.ts';

/** Camada sobre o site com os erros de conteúdo (só aparece quando há erro; no build o erro para tudo). */
export function ErrosConteudo() {
  const [fechado, setFechado] = useState(false);
  const erros = catalogo.erros;
  if (erros.length === 0 || fechado) return null;
  return (
    <div class={estilos.camada} role="alert">
      <div class={estilos.caixa}>
        <h2>
          Conteúdo inválido ({erros.length} {erros.length === 1 ? 'erro' : 'erros'})
        </h2>
        <pre class={estilos.pre}>{formatarErros(erros)}</pre>
        <button type="button" class={estilos.fechar} onClick={() => setFechado(true)}>
          Fechar
        </button>
      </div>
    </div>
  );
}
