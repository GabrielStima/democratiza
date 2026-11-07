import { useEffect } from 'preact/hooks';

/** Por quanto tempo a página continua se reajustando ao `#id` enquanto o layout muda de altura. */
const JANELA_MS = 1500;

/**
 * Rola até o elemento do `#id` da barra de endereço. Navegação interna não faz isso sozinha, e o
 * roteador, as fontes e as imagens podem mudar a altura da página logo depois de montar. Por isso
 * rola de novo a cada mudança de tamanho, por pouco tempo, e para assim que a pessoa mexe na tela.
 */
export function useRolarParaHash(): void {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const rolar = () => document.getElementById(id)?.scrollIntoView();
    rolar();
    const quadro = requestAnimationFrame(() => requestAnimationFrame(rolar));
    const observador = new ResizeObserver(rolar);
    observador.observe(document.body);
    const parar = () => observador.disconnect();
    const tempo = setTimeout(parar, JANELA_MS);
    const eventos = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    eventos.forEach((e) => window.addEventListener(e, parar, { passive: true, once: true }));
    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(tempo);
      parar();
      eventos.forEach((e) => window.removeEventListener(e, parar));
    };
  }, []);
}
