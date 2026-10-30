import { useId, useState } from 'preact/hooks';
import { dividirTermos } from './fluxo.ts';
import estilos from './licao.module.css';

/** Palavra do glossário: a definição aparece ao passar o mouse, clicar ou focar. */
function Termo({ palavra, definicao }: { palavra: string; definicao: string | undefined }) {
  const id = useId();
  const [clicado, setClicado] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [foco, setFoco] = useState(false);
  if (definicao === undefined) return <>{palavra}</>;
  const visivel = clicado || sobre || foco;
  return (
    <span
      class={estilos.termoCaixa}
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
    >
      <button
        type="button"
        class={estilos.termo}
        aria-describedby={id}
        aria-expanded={visivel}
        onClick={() => setClicado((c) => !c)}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && visivel) {
            // Fecha só a definição; a janela de sair não deve abrir junto.
            e.stopPropagation();
            setClicado(false);
            setSobre(false);
            setFoco(false);
          }
        }}
      >
        {palavra}
      </button>
      <span id={id} role="tooltip" class={estilos.definicao} hidden={!visivel}>
        {definicao}
      </span>
    </span>
  );
}

export function TextoComTermos({
  texto,
  glossario,
}: {
  texto: string;
  glossario: Record<string, string>;
}) {
  return (
    <>
      {dividirTermos(texto).map((p, i) =>
        p.tipo === 'texto' ? (
          <span key={i}>{p.valor}</span>
        ) : (
          <Termo key={i} palavra={p.valor} definicao={glossario[p.valor]} />
        ),
      )}
    </>
  );
}
