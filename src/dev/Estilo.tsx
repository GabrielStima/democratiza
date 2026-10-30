import { useState } from 'preact/hooks';
import { BarraProgresso } from '../componentes/BarraProgresso';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Cartao } from '../componentes/Cartao';
import { Janela } from '../componentes/Janela';
import { Selo } from '../componentes/Selo';
import { mostrarAviso } from '../componentes/avisos';
import estilos from './Estilo.module.css';

const CORES: Array<[string, string]> = [
  ['verde-ipe', 'Primária'],
  ['verde-mata', 'Primária escura'],
  ['verde-noite', 'Títulos'],
  ['verde-claro', 'Fundo de acerto'],
  ['amarelo-ouro', 'Destaque'],
  ['amarelo-claro', 'Fundo de aviso'],
  ['azul-anil', 'Seleção e links'],
  ['azul-claro', 'Fundo de seleção'],
  ['coral', 'Erro na Prática'],
  ['coral-claro', 'Fundo de erro'],
  ['roxo-modulo', 'Nível Módulo'],
  ['texto', 'Texto'],
  ['texto-suave', 'Texto secundário'],
  ['borda', 'Bordas'],
];

const ESCALA: Array<[string, string, string]> = [
  ['Título grande', '48px', 'var(--fonte-titulo)'],
  ['Título', '30px', 'var(--fonte-titulo)'],
  ['Subtítulo', '22px', 'var(--fonte-titulo)'],
  ['Texto', '16px', 'var(--fonte-texto)'],
  ['Texto pequeno', '13px', 'var(--fonte-texto)'],
];

/** Guia de estilo (só dev e prévias). Cada item usa o componente real. */
export function Estilo() {
  const [aberta, setAberta] = useState(false);
  return (
    <div class={estilos.pagina}>
      <h1>Guia de estilo</h1>

      <section aria-labelledby="g-cores">
        <h2 id="g-cores">Cores</h2>
        <ul class={estilos.cores}>
          {CORES.map(([nome, uso]) => (
            <li key={nome}>
              <span class={estilos.amostra} style={{ background: `var(--${nome})` }} />
              <strong>{nome}</strong>
              <span>{uso}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="g-tipo">
        <h2 id="g-tipo">Tipografia</h2>
        {ESCALA.map(([nome, tam, fonte]) => (
          <p
            key={nome}
            style={{ fontSize: tam, fontFamily: fonte, margin: '8px 0', fontWeight: 800 }}
          >
            {nome} · {tam}
          </p>
        ))}
      </section>

      <section aria-labelledby="g-botoes">
        <h2 id="g-botoes">Botões</h2>
        <div class={estilos.linha}>
          <Botao3D>Primário</Botao3D>
          <Botao3D variante="secundario">Secundário</Botao3D>
          <Botao3D variante="perigo">Perigo</Botao3D>
          <Botao3D variante="neutro">Neutro</Botao3D>
          <Botao3D desativado>Desativado</Botao3D>
        </div>
      </section>

      <section aria-labelledby="g-selos">
        <h2 id="g-selos">Selos de nível</h2>
        <div class={estilos.linha}>
          <Selo nivel="introducao" />
          <Selo nivel="aprofundamento" />
          <Selo nivel="modulo" />
        </div>
      </section>

      <section aria-labelledby="g-cartao">
        <h2 id="g-cartao">Cartão e barra de progresso</h2>
        <Cartao>
          <p style={{ marginTop: 0 }}>Um cartão com borda de 2 px e sombra inferior.</p>
          <BarraProgresso valor={45} rotulo="Exemplo: 45% concluído" />
        </Cartao>
      </section>

      <section aria-labelledby="g-capi">
        <h2 id="g-capi">Capi</h2>
        <div class={estilos.linha}>
          <Capi tamanho={48} />
          <Capi tamanho={96} />
          <Capi tamanho={160} />
        </div>
      </section>

      <section aria-labelledby="g-janela">
        <h2 id="g-janela">Janela e aviso</h2>
        <div class={estilos.linha}>
          <Botao3D variante="secundario" onClick={() => setAberta(true)}>
            Abrir janela
          </Botao3D>
          <Botao3D
            variante="neutro"
            onClick={() => mostrarAviso('Backup salvo. Guarde o arquivo em um lugar seguro.')}
          >
            Mostrar aviso
          </Botao3D>
        </div>
        <Janela titulo="Janela de exemplo" aberta={aberta} aoFechar={() => setAberta(false)}>
          <div class={estilos.janela}>
            <Capi tamanho={80} />
            <h2>Sair da lição?</h2>
            <p>Seu avanço fica salvo. Quando você voltar, continua de onde parou.</p>
            <Botao3D onClick={() => setAberta(false)}>Continuar a lição</Botao3D>
            <Botao3D variante="neutro" onClick={() => setAberta(false)}>
              Sair
            </Botao3D>
          </div>
        </Janela>
      </section>
    </div>
  );
}

export default Estilo;
