import { Botao3D } from '../componentes/Botao3D';
import { Capi } from '../componentes/Capi';
import { Janela } from '../componentes/Janela';
import type { ResumoBackup } from '../storage/exportar.ts';
import { textoResumo } from './dados.ts';
import estilos from './sobre.module.css';

function Corpo({
  etiqueta,
  titulo,
  children,
}: {
  etiqueta: string;
  titulo: string;
  children: preact.ComponentChildren;
}) {
  return (
    <div class={estilos.janela}>
      <Capi tamanho={72} />
      <span class={estilos.etiqueta}>{etiqueta}</span>
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

/** "Substituir o seu progresso?": mostra o arquivo e o que ele tem, antes de trocar. */
export function JanelaSubstituir({
  aberta,
  arquivo,
  resumo,
  aoConfirmar,
  aoFechar,
}: {
  aberta: boolean;
  arquivo: string;
  resumo: ResumoBackup | null;
  aoConfirmar: () => void;
  aoFechar: () => void;
}) {
  return (
    <Janela titulo="Substituir o seu progresso?" aberta={aberta} aoFechar={aoFechar}>
      <Corpo etiqueta="Abrir backup" titulo="Substituir o seu progresso?">
        <p>
          O arquivo <strong>{arquivo}</strong> tem{' '}
          {resumo ? textoResumo(resumo) : 'o seu progresso'}. O progresso que está neste navegador
          será trocado por ele.
        </p>
        <div class={estilos.acoes}>
          <Botao3D variante="secundario" onClick={aoConfirmar}>
            Substituir
          </Botao3D>
          <Botao3D variante="neutro" onClick={aoFechar}>
            Cancelar
          </Botao3D>
        </div>
      </Corpo>
    </Janela>
  );
}

/** "Apagar todo o seu progresso?": avisa que não dá para desfazer e oferece o backup. */
export function JanelaApagar({
  aberta,
  aoSalvarAntes,
  aoConfirmar,
  aoFechar,
}: {
  aberta: boolean;
  aoSalvarAntes: () => void;
  aoConfirmar: () => void;
  aoFechar: () => void;
}) {
  return (
    <Janela titulo="Apagar todo o seu progresso?" aberta={aberta} aoFechar={aoFechar}>
      <Corpo etiqueta="Apagar progresso" titulo="Apagar todo o seu progresso?">
        <p>
          Isso remove XP, ofensiva, lições feitas e o caderno deste navegador.{' '}
          <strong>Não dá para desfazer.</strong> Se quiser guardar tudo, salve um backup antes.
        </p>
        <button type="button" class={estilos.link} onClick={aoSalvarAntes}>
          Salvar backup antes
        </button>
        <div class={estilos.acoes}>
          <Botao3D variante="perigo" onClick={aoConfirmar}>
            Apagar tudo
          </Botao3D>
          <Botao3D variante="neutro" onClick={aoFechar}>
            Cancelar
          </Botao3D>
        </div>
      </Corpo>
    </Janela>
  );
}

/** "Não foi possível abrir o arquivo": o progresso atual nunca é tocado. */
export function JanelaArquivoInvalido({
  aberta,
  motivo,
  aoFechar,
}: {
  aberta: boolean;
  motivo: string;
  aoFechar: () => void;
}) {
  return (
    <Janela titulo="Não foi possível abrir o arquivo" aberta={aberta} aoFechar={aoFechar}>
      <Corpo etiqueta="Abrir backup" titulo="Não foi possível abrir o arquivo">
        <p>
          Esse arquivo não parece ser um backup do Democratiza, ou foi gerado por uma versão mais
          nova. <strong>Seu progresso atual não foi alterado.</strong>
        </p>
        {motivo && <p class={estilos.motivo}>Detalhe: {motivo}.</p>}
        <div class={estilos.acoes}>
          <Botao3D onClick={aoFechar}>Entendi</Botao3D>
        </div>
      </Corpo>
    </Janela>
  );
}
