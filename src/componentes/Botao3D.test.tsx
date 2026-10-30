import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Botao3D } from './Botao3D';

describe('Botao3D', () => {
  it('vira link quando recebe href', () => {
    render(<Botao3D href="/cursos">Ver</Botao3D>);
    expect(screen.getByRole('link', { name: 'Ver' }).getAttribute('href')).toBe('/cursos');
  });

  it('desativado não dispara o clique', () => {
    const aoClicar = vi.fn();
    render(
      <Botao3D desativado onClick={aoClicar}>
        Verificar
      </Botao3D>,
    );
    const botao = screen.getByRole('button', { name: 'Verificar' }) as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    botao.click();
    expect(aoClicar).not.toHaveBeenCalled();
  });
});
