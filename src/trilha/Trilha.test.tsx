import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { BannerUnidade, Trilha } from './Trilha';
import type { NoDaTrilha } from './nos.ts';

const nos: NoDaTrilha[] = [
  { id: 'a', titulo: 'Executivo', tipo: 'feita', destino: '/c/x/u/a' },
  { id: 'b', titulo: 'Legislativo', tipo: 'atual', destino: '/c/x/u/b' },
  { id: 'c', titulo: 'Judiciário', tipo: 'bloqueada', destino: '/c/x/u/c' },
  { id: 'd', titulo: 'Desafio', tipo: 'desafio', destino: '/c/x/u/d' },
];

describe('Trilha', () => {
  it('feita e atual são links; bloqueada e troféu são botões desativados', () => {
    render(<Trilha nos={nos} />);
    expect(screen.getByRole('link', { name: 'Executivo (feita)' }).getAttribute('href')).toBe(
      '/c/x/u/a',
    );
    expect(screen.getByRole('link', { name: 'Começar: Legislativo' }).getAttribute('href')).toBe(
      '/c/x/u/b',
    );
    const bloqueada = screen.getByRole('button', { name: 'Judiciário (bloqueada)' });
    expect(bloqueada.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: /Desafio.*desafio da unidade/ })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('o nó atual mostra o balão Começar e desloca cada nó em zigue-zague', () => {
    const { container } = render(<Trilha nos={nos} />);
    expect(container.textContent).toContain('Começar');
    const desloc = Array.from(container.querySelectorAll<HTMLElement>('span[style]')).map(
      (e) => e.style.transform,
    );
    expect(desloc).toEqual([
      'translateX(0px)',
      'translateX(-46px)',
      'translateX(-64px)',
      'translateX(-46px)',
    ]);
  });

  it('continua o desenho a partir de `inicio`', () => {
    const { container } = render(<Trilha nos={nos.slice(0, 1)} inicio={5} />);
    expect(container.querySelector<HTMLElement>('span[style]')?.style.transform).toBe(
      'translateX(46px)',
    );
  });

  it('visitante: o nó atual vira botão que abre a meta', () => {
    const abrir = vi.fn();
    render(<Trilha nos={nos} aoAbrirAtual={abrir} />);
    fireEvent.click(screen.getByRole('button', { name: 'Começar: Legislativo' }));
    expect(abrir).toHaveBeenCalledOnce();
  });
});

describe('BannerUnidade', () => {
  it('mostra o número, o título e o guia só quando existe', () => {
    const { rerender } = render(
      <BannerUnidade numero={2} titulo="Como a democracia funciona" estado="atual" guia="/c/x" />,
    );
    expect(screen.getByRole('heading', { name: 'Como a democracia funciona' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Guia da unidade 2' }).getAttribute('href')).toBe(
      '/c/x',
    );
    rerender(
      <BannerUnidade
        numero={3}
        titulo="Eleições e voto"
        estado="bloqueada"
        aviso="Libera ao terminar a Unidade 2"
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Libera ao terminar a Unidade 2')).toBeTruthy();
  });

  it('a unidade feita diz que está concluída', () => {
    render(<BannerUnidade numero={1} titulo="O que é democracia" estado="feita" />);
    expect(screen.getByText(/concluída/)).toBeTruthy();
  });
});
