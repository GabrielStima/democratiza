import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import estilos from './Janela.module.css';

interface Props {
  titulo: string;
  aberta: boolean;
  aoFechar: () => void;
  /** Caixa mais larga, para janelas com bastante texto. */
  larga?: boolean;
  children: ComponentChildren;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Caixa de diálogo: fundo escurecido, foco preso dentro e Esc para fechar. */
export function Janela({ titulo, aberta, aoFechar, larga = false, children }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const aoFecharRef = useRef(aoFechar);
  aoFecharRef.current = aoFechar;

  // Layout effect: o ouvinte de teclado precisa estar ligado assim que a janela aparece.
  useLayoutEffect(() => {
    if (!aberta) return;
    const anterior = document.activeElement as HTMLElement | null;
    const elementos = () =>
      Array.from(caixa.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? []);
    (elementos()[0] ?? caixa.current)?.focus();

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        aoFecharRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const lista = elementos();
      if (lista.length === 0) {
        e.preventDefault();
        return;
      }
      const primeiro = lista[0] as HTMLElement;
      const ultimo = lista[lista.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      anterior?.focus?.();
    };
  }, [aberta]);

  if (!aberta) return null;
  return (
    <div class={estilos.fundo} onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div
        ref={caixa}
        class={larga ? `${estilos.caixa} ${estilos.larga}` : estilos.caixa}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
