import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import estilos from './BarraAbas.module.css';
import { ICONES_MENU } from './IconesMenu';

export const ABAS = [
  { href: '/', rotulo: 'Aprender', icone: ICONES_MENU.aprender },
  { href: '/cursos', rotulo: 'Cursos', icone: ICONES_MENU.cursos },
  { href: '/revisar', rotulo: 'Revisar', icone: ICONES_MENU.revisar },
  { href: '/caderno', rotulo: 'Caderno', icone: ICONES_MENU.caderno },
  { href: '/sobre', rotulo: 'Sobre', icone: ICONES_MENU.sobre },
];

/** Barra de abas fixa embaixo, só com ícones. O nome de cada aba fica no aria-label. */
export function BarraAbas({ vencidos }: { vencidos: number }) {
  const { path } = useLocation();
  // Avisa o resto da página que existe uma barra embaixo (o Aviso sobe para ficar acima dela).
  useEffect(() => {
    document.body.dataset.abas = '1';
    return () => {
      delete document.body.dataset.abas;
    };
  }, []);
  return (
    <nav aria-label="Principal" class={estilos.abas}>
      {ABAS.map((a) => {
        const ativa = path === a.href;
        return (
          <a
            key={a.href}
            href={a.href}
            class={ativa ? `${estilos.aba} ${estilos.ativa}` : estilos.aba}
            aria-label={
              a.href === '/revisar' && vencidos > 0
                ? `${a.rotulo}, ${vencidos} ${vencidos === 1 ? 'conceito' : 'conceitos'} para revisar`
                : a.rotulo
            }
            aria-current={ativa ? 'page' : undefined}
          >
            {a.icone}
            {a.href === '/revisar' && vencidos > 0 && (
              <span class={estilos.contagem}>{vencidos}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
