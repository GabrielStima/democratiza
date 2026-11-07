import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { BarraProgressoGrossa } from './BarraProgressoGrossa';
import { CartaoResultado, ResultadoEmLinha } from './CartaoResultado';
import { CartaoFeedback } from './CartaoFeedback';

describe('BarraProgressoGrossa', () => {
  it('expõe o valor e limita entre 0 e 100', () => {
    const { rerender } = render(<BarraProgressoGrossa valor={55.4} rotulo="Lição" />);
    expect(screen.getByRole('progressbar', { name: 'Lição' }).getAttribute('aria-valuenow')).toBe(
      '55',
    );
    rerender(<BarraProgressoGrossa valor={180} rotulo="Lição" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    rerender(<BarraProgressoGrossa valor={-5} rotulo="Lição" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });
});

describe('CartaoFeedback', () => {
  it('mostra o título e o texto de apoio', () => {
    render(
      <CartaoFeedback tom="certa" titulo="Isso mesmo! +10 XP">
        <p>Lei estadual vale só no estado.</p>
      </CartaoFeedback>,
    );
    expect(screen.getByRole('heading', { name: 'Isso mesmo! +10 XP' })).toBeTruthy();
    expect(screen.getByText('Lei estadual vale só no estado.')).toBeTruthy();
  });
  it('funciona sem texto de apoio', () => {
    render(<CartaoFeedback tom="errada" titulo="Não foi dessa vez" />);
    expect(screen.getByRole('heading', { name: 'Não foi dessa vez' })).toBeTruthy();
  });
});

describe('CartaoResultado', () => {
  it('lista rótulo e valor dentro do grupo Resultado', () => {
    render(
      <ResultadoEmLinha>
        <CartaoResultado rotulo="XP ganho" valor="55" cor="ouro" />
        <CartaoResultado rotulo="Tempo" valor="5:48" cor="azul" />
      </ResultadoEmLinha>,
    );
    const lista = screen.getByRole('list', { name: 'Resultado' });
    expect(lista.textContent).toContain('XP ganho');
    expect(lista.textContent).toContain('5:48');
  });
});
