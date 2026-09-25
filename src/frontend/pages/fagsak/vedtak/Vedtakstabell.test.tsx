import type { Beregningsresultat } from '@/generated-new/types.gen';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Vedtakstabell } from './Vedtakstabell';

const lagBeregningsresultat = (overrides?: Partial<Beregningsresultat>): Beregningsresultat => ({
    vedtaksresultat: 'DelvisTilbakebetaling',
    totaltBeløpIBehold: 0,
    totaltReduksjon: 0,
    totaltRentebeløp: 10,
    totaltSkattebeløp: 3500,
    totaltFeilutbetaltBeløp: 15000,
    totaltTilbakekrevingsbeløp: 13500,
    beregningsresultatsperioder: [
        {
            fom: '2024-01-01',
            tom: '2024-03-31',
            feilutbetaltBeløp: 10000,
            vurdering: 'Forsett',
            rentebeløp: 10,
            tilbakekrevingsbeløp: 11000,
            skattebeløp: 3000,
            beløpIBehold: 0,
            reduksjon: 0,
        },
        {
            fom: '2024-04-01',
            tom: '2024-06-30',
            feilutbetaltBeløp: 5000,
            vurdering: 'GodTro',
            rentebeløp: 0,
            tilbakekrevingsbeløp: 2500,
            skattebeløp: 500,
            beløpIBehold: 0,
            reduksjon: 0,
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
        expect(screen.getByRole('columnheader', { name: 'I behold' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Reduksjon' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Renter' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Skatt' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Beløp' })).toBeInTheDocument();
    });

    test('viser periodedata med riktig formatering i hver celle', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        const rader = screen.getAllByRole('row');
        expect(rader).toHaveLength(4); // 1 header + 2 perioder + 1 sum

        const celler = hentCeller(rader[1]);
        expect(celler[0]).toHaveTextContent('01.01.2024\u201331.03.2024');
        expect(celler[1]).toHaveTextContent('10 000 kr');
        expect(celler[2]).toHaveTextContent('Forsett');
        expect(celler[3]).toHaveTextContent('Ikke relevant');
        expect(celler[4]).toHaveTextContent('');
        expect(celler[5]).toHaveTextContent('10 kr');
        expect(celler[6]).toHaveTextContent('–3 000 kr');
        expect(celler[7]).toHaveTextContent('11 000 kr');
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
                            vurdering: 'Forsett',
                            rentebeløp: 10,
                            tilbakekrevingsbeløp: 1100,
                            skattebeløp: 300,
                            beløpIBehold: 0,
                            reduksjon: 0,
                        },
                        {
                            fom: '2024-02-01',
                            tom: '2024-02-29',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'GrovUaktsomhet',
                            rentebeløp: 10,
                            tilbakekrevingsbeløp: 1100,
                            skattebeløp: 300,
                            beløpIBehold: 0,
                            reduksjon: 0,
                        },
                        {
                            fom: '2024-03-01',
                            tom: '2024-03-31',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'Uaktsomhet',
                            rentebeløp: 0,
                            tilbakekrevingsbeløp: 500,
                            skattebeløp: 100,
                            beløpIBehold: 0,
                            reduksjon: 0,
                        },
                        {
                            fom: '2024-04-01',
                            tom: '2024-04-30',
                            feilutbetaltBeløp: 1000,
                            vurdering: 'GodTro',
                            rentebeløp: 0,
                            tilbakekrevingsbeløp: 0,
                            skattebeløp: 0,
                            beløpIBehold: 0,
                            reduksjon: 0,
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

        expect(sumCeller[0]).toHaveTextContent('Totalt beløp');
        expect(sumCeller[1]).toHaveTextContent('15 000 kr'); // 10000 + 5000
        expect(sumCeller[3]).toHaveTextContent('0 kr');
        expect(sumCeller[4]).toHaveTextContent('–0 kr');
        expect(sumCeller[5]).toHaveTextContent('10 kr');
        expect(sumCeller[6]).toHaveTextContent('–3 500 kr'); // 3000 + 500
        expect(sumCeller[7]).toHaveTextContent('13 500 kr'); // 11000 + 2500
    });

    test('viser tomme celler i sumraden', () => {
        render(<Vedtakstabell beregningsresultat={lagBeregningsresultat()} />);

        const rader = screen.getAllByRole('row');
        const sumCeller = hentCeller(rader[rader.length - 1]);

        expect(sumCeller[2]).toHaveTextContent('');
        expect(sumCeller[4]).toHaveTextContent('–0 kr');
        expect(sumCeller[5]).toHaveTextContent('10 kr');
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
                            vurdering: 'GrovUaktsomhet',
                            beløpIBehold: 123,
                            reduksjon: 75,
                            rentebeløp: 10,
                            tilbakekrevingsbeløp: 2625,
                            skattebeløp: 725,
                        },
                    ],
                    totaltBeløpIBehold: 123,
                    totaltReduksjon: 75,
                    totaltRentebeløp: 10,
                    totaltSkattebeløp: 725,
                    totaltFeilutbetaltBeløp: 3500,
                    totaltTilbakekrevingsbeløp: 2625,
                })}
            />
        );

        const rader = screen.getAllByRole('row');
        expect(rader).toHaveLength(3); // 1 header + 1 periode + 1 sum

        const sumCeller = hentCeller(rader[2]);
        expect(sumCeller[1]).toHaveTextContent('3 500 kr');
        expect(sumCeller[3]).toHaveTextContent('123 kr');
        expect(sumCeller[6]).toHaveTextContent('–725 kr');
        expect(sumCeller[7]).toHaveTextContent('2 625 kr');
    });

    test('viser reduksjon og skatt som minusbeløp', () => {
        render(
            <Vedtakstabell
                beregningsresultat={lagBeregningsresultat({
                    beregningsresultatsperioder: [
                        {
                            fom: '2025-12-01',
                            tom: '2025-12-31',
                            feilutbetaltBeløp: 3500,
                            vurdering: 'GrovUaktsomhet',
                            beløpIBehold: 123,
                            reduksjon: 250,
                            rentebeløp: 10,
                            tilbakekrevingsbeløp: 2625,
                            skattebeløp: 725,
                        },
                    ],
                    totaltBeløpIBehold: 123,
                    totaltReduksjon: 250,
                    totaltRentebeløp: 10,
                    totaltSkattebeløp: 725,
                    totaltFeilutbetaltBeløp: 3500,
                    totaltTilbakekrevingsbeløp: 2625,
                })}
            />
        );

        const rader = screen.getAllByRole('row');
        const periodeCeller = hentCeller(rader[1]);
        const sumCeller = hentCeller(rader[2]);

        expect(periodeCeller[4]).toHaveTextContent('–250 kr');
        expect(periodeCeller[6]).toHaveTextContent('–725 kr');
        expect(sumCeller[4]).toHaveTextContent('–250 kr');
        expect(sumCeller[6]).toHaveTextContent('–725 kr');
    });
});
