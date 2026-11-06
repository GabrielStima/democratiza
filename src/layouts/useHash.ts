import { useEffect } from 'preact/hooks';

/** Rola até o elemento do `#id` da barra de endereço. Navegação interna não faz isso sozinha. */
export function useRolarParaHash(): void {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
}
