import { cleanup, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { ehMobile } from '../layouts/mobile.ts';
import { LicaoConcluida, type DadosConcluida } from './Telas';

const dados: DadosConcluida = {
  xpGanho: 55,
  refeita: false,
  acertos: 5,
  total: 6,
  tempo: '2 s',
  novos: [{ id: 'k1', nome: 'Lorem ipsum 1', definicao: 'Lorem ipsum dolor sit amet.' }],
  proxima: 'Lorem lição dois',
  cursosLiberados: [],
};

afterEach(() => {
  cleanup();
  ehMobile.value = false;
});

describe('LicaoConcluida', () => {
  it('no celular mostra a comemoração e os três cartões de resultado', () => {
    ehMobile.value = true;
    const { container } = render(<LicaoConcluida d={dados} nome="Lição modelo" />);
    expect(screen.getByRole('heading', { name: 'Lição concluída!' })).toBeTruthy();
    const resultado = screen.getByRole('list', { name: 'Resultado' });
    expect(resultado.textContent).toContain('Total de XP');
    expect(resultado.textContent).toContain('55');
    expect(resultado.textContent).toContain('5 de 6');
    expect(resultado.textContent).toContain('2 s');
    // O confete só decora: escondido do leitor de tela.
    const confetes = container.querySelector('[aria-hidden="true"]');
    expect(confetes?.children.length).toBeGreaterThan(0);
  });

  it('no desktop mantém os números simples, sem confete', () => {
    ehMobile.value = false;
    const { container } = render(<LicaoConcluida d={dados} nome="Lição modelo" />);
    expect(screen.queryByRole('list', { name: 'Resultado' })).toBeNull();
    expect(screen.getByText('XP ganho')).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('avisa que a lição refeita não vale XP de novo', () => {
    ehMobile.value = true;
    render(<LicaoConcluida d={{ ...dados, refeita: true }} nome="Lição modelo" />);
    expect(screen.getByText(/XP só conta na primeira vez/)).toBeTruthy();
  });
});
