/** Traços do calendário que representa a Sequência (para usar dentro de um `<svg viewBox="0 0 24 24">`). */
export const TRACOS_SEQUENCIA = (
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8.5 15l2.3 2.3 4.7-4.6" />
  </>
);

/** Ícone de calendário com visto: marca de que a pessoa estudou. Cores só por tokens. */
export function IconeSequencia({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="var(--verde-claro)"
      stroke="var(--verde-mata)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {TRACOS_SEQUENCIA}
    </svg>
  );
}
