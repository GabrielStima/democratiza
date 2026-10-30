import type { ComponentChildren } from 'preact';

function Icone({ children }: { children: ComponentChildren }) {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={{ flex: 'none' }}
    >
      {children}
    </svg>
  );
}

export const ICONES_MENU = {
  aprender: (
    <Icone>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Icone>
  ),
  cursos: (
    <Icone>
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icone>
  ),
  revisar: (
    <Icone>
      <path d="M4 12a8 8 0 1 0 2.3-5.7" />
      <path d="M4 4v4h4" />
    </Icone>
  ),
  caderno: (
    <Icone>
      <path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h6M8 11h6" />
    </Icone>
  ),
  sobre: (
    <Icone>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7.5v.5" />
    </Icone>
  ),
} as const;
