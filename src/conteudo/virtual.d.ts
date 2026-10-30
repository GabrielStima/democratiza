declare module 'virtual:democratiza/catalogo' {
  const catalogo: import('../content-schema/tipos').Catalogo;
  export default catalogo;
}

declare module 'virtual:democratiza/bibliografia' {
  const bibliografia: import('../content-schema/tipos').ItemBibliografia[];
  export default bibliografia;
}

declare module 'virtual:democratiza/licoes' {
  export const carregadores: Record<
    string,
    () => Promise<{ default: import('../content-schema/licao').Licao }>
  >;
}
