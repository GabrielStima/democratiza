import { useRef, useState } from 'preact/hooks';
import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Selo } from '../componentes/Selo';
import { mostrarAviso } from '../componentes/avisos.ts';
import { bibliografia } from '../conteudo/index.ts';
import { REPOSITORIO } from '../licao/fluxo.ts';
import {
  apagarProgresso,
  conferirBackup,
  estado,
  salvarBackup,
  substituirPorBackup,
} from '../stores/index.ts';
import type { ResumoBackup } from '../storage/exportar.ts';
import { PRINCIPIOS } from '../textos/principios.ts';
import { textoUso } from './dados.ts';
import { JanelaApagar, JanelaArquivoInvalido, JanelaSubstituir } from './JanelasDeDados';
import estilos from './sobre.module.css';

const ETAPAS = [
  { rotulo: '1. Situação', cor: estilos.amarelo },
  { rotulo: '2. Explicação', cor: estilos.verde },
  { rotulo: '3. Checagem', cor: estilos.azul },
  { rotulo: '4. Prática', cor: estilos.verde },
  { rotulo: '5. Caderno e revisão', cor: estilos.amarelo },
] as const;

const NIVEIS = [
  {
    nivel: 'introducao',
    rotulo: 'Introdução',
    texto: 'O básico, para quem está começando do zero.',
  },
  {
    nivel: 'aprofundamento',
    rotulo: 'Aprofundamentos',
    texto: 'Um tema com mais detalhe, com o que cada autor defende.',
  },
  {
    nivel: 'modulo',
    rotulo: 'Módulos',
    texto: 'Um assunto específico, incluindo os debates entre correntes.',
  },
] as const;

type Janela = 'nenhuma' | 'substituir' | 'apagar' | 'invalido';

function SeusDados() {
  const entrada = useRef<HTMLInputElement>(null);
  const [janela, setJanela] = useState<Janela>('nenhuma');
  const [arquivo, setArquivo] = useState({ nome: '', texto: '' });
  const [resumo, setResumo] = useState<ResumoBackup | null>(null);
  const [motivo, setMotivo] = useState('');
  const temProgresso = estado.value !== null;

  function salvar() {
    salvarBackup();
    mostrarAviso('Backup salvo. Guarde o arquivo em um lugar seguro.');
  }

  async function aoEscolherArquivo(e: Event) {
    const campo = e.currentTarget as HTMLInputElement;
    const arq = campo.files?.[0];
    campo.value = '';
    if (!arq) return;
    const texto = await arq.text().catch(() => '');
    const leitura = conferirBackup(texto);
    if (leitura.ok) {
      setArquivo({ nome: arq.name, texto });
      setResumo(leitura.resumo);
      setJanela('substituir');
    } else {
      setMotivo(leitura.motivo);
      setJanela('invalido');
    }
  }

  async function substituir() {
    const r = await substituirPorBackup(arquivo.texto);
    if (r.ok) {
      setJanela('nenhuma');
      mostrarAviso('Progresso restaurado.');
    } else {
      setMotivo(r.motivo);
      setJanela('invalido');
    }
  }

  async function apagar() {
    await apagarProgresso();
    setJanela('nenhuma');
    mostrarAviso('Progresso apagado. Você pode recomeçar quando quiser.');
  }

  return (
    <section aria-labelledby="dados" class={estilos.secao}>
      <h2 id="dados">Seus dados</h2>
      <p class={estilos.texto}>
        Seu progresso fica salvo só neste navegador. Para usar em outro computador, ou para não
        perder nada se limpar o navegador, salve um arquivo de backup e abra ele no outro lugar.
      </p>
      <div class={estilos.botoes}>
        <Botao3D desativado={!temProgresso} onClick={salvar}>
          Salvar backup
        </Botao3D>
        <Botao3D variante="neutro" onClick={() => entrada.current?.click()}>
          Abrir backup
        </Botao3D>
        <Botao3D variante="perigo" desativado={!temProgresso} onClick={() => setJanela('apagar')}>
          Apagar meu progresso
        </Botao3D>
      </div>
      {!temProgresso && (
        <p class={estilos.dica}>Você ainda não tem progresso para salvar ou apagar.</p>
      )}
      <input
        ref={entrada}
        type="file"
        accept=".json,application/json"
        class={estilos.escondido}
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => void aoEscolherArquivo(e)}
      />
      <JanelaSubstituir
        aberta={janela === 'substituir'}
        arquivo={arquivo.nome}
        resumo={resumo}
        aoConfirmar={() => void substituir()}
        aoFechar={() => setJanela('nenhuma')}
      />
      <JanelaApagar
        aberta={janela === 'apagar'}
        aoSalvarAntes={salvar}
        aoConfirmar={() => void apagar()}
        aoFechar={() => setJanela('nenhuma')}
      />
      <JanelaArquivoInvalido
        aberta={janela === 'invalido'}
        motivo={motivo}
        aoFechar={() => setJanela('nenhuma')}
      />
    </section>
  );
}

/** Página Sobre: projeto, princípios, método, dados do usuário, bibliografia. */
export function Sobre() {
  return (
    <div class={estilos.pagina}>
      <header class={estilos.cabeca}>
        <Capi tamanho={130} />
        <div>
          <h1>Sobre o Democratiza</h1>
          <p>
            Um projeto independente e de código aberto para ensinar política a quem está começando
            do zero, com lições curtas e base acadêmica.
          </p>
        </div>
      </header>

      <section aria-labelledby="principios" class={estilos.secao}>
        <h2 id="principios">Nossos princípios</h2>
        <ul class={estilos.grade}>
          {PRINCIPIOS.map((p) => (
            <li key={p.titulo} class={estilos.cartao}>
              <strong>{p.titulo}</strong>
              <span>{p.texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como" class={estilos.secao}>
        <h2 id="como">Como ensinamos</h2>
        <p class={estilos.texto}>
          No inglês você junta palavras. Aqui você junta conceitos. Toda lição segue o mesmo
          caminho:
        </p>
        <ol class={estilos.etapas}>
          {ETAPAS.map((e) => (
            <li key={e.rotulo} class={`${estilos.etapa} ${e.cor ?? ''}`}>
              {e.rotulo}
            </li>
          ))}
        </ol>
        <ul class={estilos.grade}>
          {NIVEIS.map((n) => (
            <li key={n.nivel} class={`${estilos.nivel} ${estilos[n.nivel] ?? ''}`}>
              <Selo nivel={n.nivel}>{n.rotulo}</Selo>
              <span>{n.texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <SeusDados />

      <section aria-labelledby="bibliografia" class={estilos.secao}>
        <div>
          <h2 id="bibliografia">Bibliografia</h2>
          <p class={estilos.dica}>Montada automaticamente com as fontes de todas as lições.</p>
        </div>
        {bibliografia.length === 0 ? (
          <p class={estilos.texto}>As fontes aparecem aqui quando houver lições publicadas.</p>
        ) : (
          <ul class={estilos.biblio}>
            {bibliografia.map((b) => (
              <li key={b.descricao}>
                <span class={estilos.referencia}>
                  {b.descricao}
                  {b.link && (
                    <>
                      {' '}
                      <a href={b.link} target="_blank" rel="noopener noreferrer">
                        {new URL(b.link).hostname.replace(/^www\./, '')}
                      </a>
                    </>
                  )}
                </span>
                <span class={estilos.uso}>{textoUso(b.usadaEm)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="erro" class={estilos.erro}>
        <div>
          <h2 id="erro">Encontrou um erro?</h2>
          <p>
            Toda lição tem um botão para avisar. Você também pode abrir uma sugestão direto no
            repositório, onde todo o código e o conteúdo são públicos.
          </p>
        </div>
        <div class={estilos.botoes}>
          <Botao3D variante="neutro" href={`${REPOSITORIO}/issues/new`}>
            Sugerir correção
          </Botao3D>
          <Botao3D variante="neutro" href={REPOSITORIO}>
            Ver código no GitHub
          </Botao3D>
        </div>
      </section>
    </div>
  );
}
