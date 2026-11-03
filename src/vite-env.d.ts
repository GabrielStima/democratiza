/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** "1" inclui lições `rascunho` e as telas de desenvolvimento. */
  readonly VITE_MOSTRAR_RASCUNHOS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
