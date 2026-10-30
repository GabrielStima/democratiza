import { useEffect, useRef } from 'preact/hooks';

/**
 * Esc abre a confirmação de sair. Se uma janela já está aberta (`bloqueado`), é ela que
 * trata o Esc, então este ouvinte não faz nada.
 */
export function useEscSair(aoApertar: () => void, bloqueado: boolean): void {
  const ref = useRef({ aoApertar, bloqueado });
  ref.current = { aoApertar, bloqueado };
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape' && !ref.current.bloqueado) ref.current.aoApertar();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);
}
