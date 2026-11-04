import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { BarraProgressoGrossa } from './BarraProgressoGrossa';
import { CartaoResultado, ResultadoEmLinha } from './CartaoResultado';
import { PainelFeedback } from './PainelFeedback';

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

describe('PainelFeedback', () => {
  it('mostra o título e o texto de apoio', () => {
    render(
      <PainelFeedback tom="certa" titulo="Mandou bem! +10 XP">
        <p>Lei estadual vale só no estado.</p>
      </PainelFeedback>,
    );
    expect(screen.getByRole('heading', { name: 'Mandou bem! +10 XP' })).toBeTruthy();
    expect(screen.getByText('Lei estadual vale só no estado.')).toBeTruthy();
  });
  it('funciona sem texto de apoio', () => {
    render(<PainelFeedback tom="errada" titulo="Resposta certa: Minas Gerais" />);
    expect(screen.getByRole('heading', { name: /Resposta certa/ })).toBeTruthy();
  });
});

describe('CartaoResultado', () => {
  it('lista rótulo e valor dentro do grupo Resultado', () => {
    render(
      <ResultadoEmLinha>
        <CartaoResultado rotulo="Total de XP" valor="55" cor="ouro" />
        <CartaoResultado rotulo="Tempo" valor="5:48" cor="azul" />
      </ResultadoEmLinha>,
    );
    const lista = screen.getByRole('list', { name: 'Resultado' });
    expect(lista.textContent).toContain('Total de XP');
    expect(lista.textContent).toContain('5:48');
  });
});
