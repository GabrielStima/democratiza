import { registerSW } from 'virtual:pwa-register';
import { mostrarAviso } from '../componentes/avisos.ts';

type Registrar = (opcoes: {
  onNeedRefresh: () => void;
  onOfflineReady: () => void;
}) => (recarregar?: boolean) => Promise<void>;

export const TEXTO_NOVA_VERSAO = 'Nova versão disponível.';
export const TEXTO_OFFLINE_PRONTO = 'Pronto: o Democratiza já funciona sem internet.';

/** Liga o service worker aos avisos: "Nova versão disponível" (com botão) e "já funciona offline". */
export function ligarAvisosDoPwa(registrar: Registrar): void {
  const atualizar = registrar({
    onNeedRefresh() {
      mostrarAviso(TEXTO_NOVA_VERSAO, 0, {
        rotulo: 'Atualizar',
        aoClicar: () => void atualizar(true),
      });
    },
    onOfflineReady() {
      mostrarAviso(TEXTO_OFFLINE_PRONTO, 6000);
    },
  });
}

/** Só no site publicado (o `npm run dev` não usa service worker, para não esconder mudanças). */
export function registrarServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  ligarAvisosDoPwa(registerSW);
}
