import estilos from './licao.module.css';

export type EstadoOpcao = 'certa' | 'amarela' | 'errada';

const MARCA: Record<EstadoOpcao, string> = {
  certa: 'Resposta certa',
  amarela: 'Sua resposta',
  errada: 'Sua resposta',
};

interface Props {
  /** Nome do grupo (único na tela). */
  nome: string;
  /** Pergunta ou instrução lida pelo leitor de tela. */
  legenda: string;
  opcoes: string[];
  valor: number | null;
  aoEscolher: (i: number) => void;
  /** Depois de verificar: trava as opções. */
  travado?: boolean;
  /** Cor e etiqueta de cada opção (a cor nunca é o único sinal). */
  estados?: Partial<Record<number, EstadoOpcao>>;
}

/** Escolha única com botões de rádio de verdade: setas, Espaço e leitor de tela funcionam. */
export function Opcoes({ nome, legenda, opcoes, valor, aoEscolher, travado, estados = {} }: Props) {
  return (
    <fieldset class={estilos.opcoes}>
      <legend class="so-leitor">{legenda}</legend>
      {opcoes.map((texto, i) => {
        const estado = estados[i];
        return (
          <label key={i} class={`${estilos.opcao} ${estado ? estilos[estado] : ''}`}>
            <input
              type="radio"
              name={nome}
              checked={valor === i}
              disabled={travado}
              onChange={() => aoEscolher(i)}
            />
            <span class={estilos.caixa}>
              <span>{texto}</span>
              {estado && <span class={estilos.marca}>{MARCA[estado]}</span>}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
