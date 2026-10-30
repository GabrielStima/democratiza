import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Janela } from './Janela';

function Exemplo({ aoFechar }: { aoFechar: () => void }) {
  return (
    <Janela titulo="Sair da lição?" aberta aoFechar={aoFechar}>
      <button type="button">Continuar</button>
      <button type="button">Sair</button>
    </Janela>
  );
}

describe('Janela', () => {
  it('foca o primeiro botão ao abrir', () => {
    render(<Exemplo aoFechar={() => {}} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continuar' }));
  });

  it('fecha com Esc', () => {
    const aoFechar = vi.fn();
    render(<Exemplo aoFechar={aoFechar} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it('prende o foco: Tab no último volta ao primeiro', () => {
    render(<Exemplo aoFechar={() => {}} />);
    const ultimo = screen.getByRole('button', { name: 'Sair' });
    ultimo.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continuar' }));
  });

  it('não renderiza nada quando fechada', () => {
    render(
      <Janela titulo="x" aberta={false} aoFechar={() => {}}>
        <p>oculto</p>
      </Janela>,
    );
    expect(screen.queryByText('oculto')).toBeNull();
  });
});
