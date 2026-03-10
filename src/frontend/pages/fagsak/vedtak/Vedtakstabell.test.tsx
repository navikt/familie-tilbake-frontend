import type { Beregningsresultat } from '~/generated-new/types.gen';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Vedtakstabell } from './Vedtakstabell';

const lagBeregningsresultat = (overrides?: Partial<Beregningsresultat>): Beregningsresultat => ({
    vedtaksresultat: 'DELVIS_TILBAKEBETALING',
    harBrukerUttaltSeg: true,
    beregningsresultatsperioder: [
        {
            fom: '2024-01-01',
            tom: '2024-03-31',
            feilutbetaltBeløp: 10000,
            vurdering: 'FORSETT',
            andelAvBeløp: '100%',
            renteprosent: '10%',
            tilbakekrevingsbeløp: 11000,
            tilbakekrevesBeløpEtterSkatt: 8000,
        },
        {
            fom: '2024-04-01',
            tom: '2024-06-30',
            feilutbetaltBeløp: 5000,
            vurdering: 'GOD_TRO',
            andelAvBeløp: '50%',
            renteprosent: '0%',
            tilbakekrevingsbeløp: 2500,
            tilbakekrevesBeløpEtterSkatt: 2000,
        },
    ],
    ...overrides,
});

const hentCeller = (rad: HTMLElement): HTMLElement[] => within(rad).getAllByRole('cell');

describe('Vedtakstabell', () => {
    test('viser alle kolonneheadere', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        expect(screen.getByRole('columnheader', { name: 'Periode' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Feilutbetalt' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Vurdering' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Beløpsandel' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Renter' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Før skatt' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Etter skatt' })).toBeInTheDocument();
    });

    test('viser periodedata med riktig formatering i hver celle', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        const rader = screen.getAllByRole('row');
        expect(rader).toHaveLength(4); // 1 header + 2 perioder + 1 sum

        const celler = hentCeller(rader[1]);
        expect(celler[0]).toHaveTextContent('01.01.2024\u201331.03.2024');
        expect(celler[1]).toHaveTextContent('10 000');
        expect(celler[2]).toHaveTextContent('Forsett');
        expect(celler[3]).toHaveTextContent('100%');
        expect(celler[4]).toHaveTextContent('10%');
        expect(celler[5]).toHaveTextContent('11 000');
        expect(celler[6]).toHaveTextContent('8 000');
    });

    test('mapper vurderingstekster korrekt', () => {
        render(
            <Vedtakstabell
                beregningsresultat={lagBeregningsresultat({
                    beregningsresultatsperioder: [
                        {
                            fom: '2024-01-01',
                            tom: '2024-01-31',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'FORSETT',
                            andelAvBeløp: '100%',
                            renteprosent: '10%',
                            tilbakekrevingsbeløp: 1100,
                            tilbakekrevesBeløpEtterSkatt: 800,
                        },
                        {
                            fom: '2024-02-01',
                            tom: '2024-02-29',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'GROV_UAKTSOMHET',
                            andelAvBeløp: '100%',
                            renteprosent: '10%',
                            tilbakekrevingsbeløp: 1100,
                            tilbakekrevesBeløpEtterSkatt: 800,
                        },
                        {
                            fom: '2024-03-01',
                            tom: '2024-03-31',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'UAKTSOMHET',
                            andelAvBeløp: '50%',
                            renteprosent: '0%',
                            tilbakekrevingsbeløp: 500,
                            tilbakekrevesBeløpEtterSkatt: 400,
                        },
                        {
                            fom: '2024-04-01',
                            tom: '2024-04-30',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'GOD_TRO',
                            andelAvBeløp: '0%',
                            renteprosent: '0%',
                            tilbakekrevingsbeløp: 0,
                            tilbakekrevesBeløpEtterSkatt: 0,
                        },
                    ],
                })}
            />
        );

        const rader = screen.getAllByRole('row');
        expect(hentCeller(rader[1])[2]).toHaveTextContent('Forsett');
        expect(hentCeller(rader[2])[2]).toHaveTextContent('Grov uaktsom');
        expect(hentCeller(rader[3])[2]).toHaveTextContent('Uaktsom');
        expect(hentCeller(rader[4])[2]).toHaveTextContent('God tro');
    });

    test('beregner og viser riktige summer i bunnraden', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        const rader = screen.getAllByRole('row');
        const sumCeller = hentCeller(rader[rader.length - 1]);

        expect(sumCeller[0]).toHaveTextContent('Sum');
        expect(sumCeller[1]).toHaveTextContent('15 000'); // 10000 + 5000
        expect(sumCeller[5]).toHaveTextContent('13 500'); // 11000 + 2500
        expect(sumCeller[6]).toHaveTextContent('10 000'); // 8000 + 2000
    });

    test('tomme celler i sumraden for vurdering, andel og renter', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        const rader = screen.getAllByRole('row');
        const sumCeller = hentCeller(rader[rader.length - 1]);

        expect(sumCeller[2]).toHaveTextContent('');
        expect(sumCeller[3]).toHaveTextContent('');
        expect(sumCeller[4]).toHaveTextContent('');
    });

    test('viser én periode korrekt med riktige summer', () => {
        render(
            <Vedtakstabell
                beregningsresultat={lagBeregningsresultat({
                    beregningsresultatsperioder: [
                        {
                            fom: '2025-12-01',
                            tom: '2025-12-31',
                            feilutbetaltBeløp: 3500,
                            vurdering: 'GROV_UAKTSOMHET',
                            andelAvBeløp: '75%',
                            renteprosent: '10%',
                            tilbakekrevingsbeløp: 2625,
                            tilbakekrevesBeløpEtterSkatt: 1900,
                        },
                    ],
                })}
            />
        );

        const rader = screen.getAllByRole('row');
        expect(rader).toHaveLength(3); // 1 header + 1 periode + 1 sum

        const sumCeller = hentCeller(rader[2]);
        expect(sumCeller[1]).toHaveTextContent('3 500');
        expect(sumCeller[5]).toHaveTextContent('2 625');
        expect(sumCeller[6]).toHaveTextContent('1 900');
    });
});
