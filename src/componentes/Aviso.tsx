import { avisos, dispensarAviso } from './avisos';
import estilos from './Aviso.module.css';

/** Região fixa que mostra os avisos rápidos. Montar uma vez no app. */
export function Avisos() {
  return (
    <div class={estilos.regiao} role="status" aria-live="polite">
      {avisos.value.map((a) => (
        <div key={a.id} class={estilos.aviso}>
          <span>{a.texto}</span>
          <button
            type="button"
            class={estilos.fechar}
            aria-label="Dispensar aviso"
            onClick={() => dispensarAviso(a.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
