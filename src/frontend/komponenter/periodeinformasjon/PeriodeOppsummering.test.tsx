import type { RenderResult } from '@testing-library/react';

import { render, waitFor } from '@testing-library/react';

import { HendelseType } from '~/kodeverk';

import { PeriodeOppsummering } from './PeriodeOppsummering';

const renderPeriodeOppsummering = (
    fom: string,
    tom: string,
    beløp: number,
    hendelsestype?: HendelseType
): RenderResult =>
    render(<PeriodeOppsummering hendelsetype={hendelsestype} beløp={beløp} fom={fom} tom={tom} />);

describe('PeriodeOppsummering', () => {
    test('Uten hendelsetype og tester 5 måneder', () => {
        const { getByText } = renderPeriodeOppsummering('2021-01-01', '2021-05-31', 3333);
        expect(getByText('01.01.2021–31.05.2021')).toBeInTheDocument();
        expect(getByText('5 måneder')).toBeInTheDocument();
        expect(getByText('3 333')).toBeInTheDocument();
    });

    test('Med hendelsetype og tester 4 måneder', async () => {
        const { getByText } = renderPeriodeOppsummering(
            '2021-01-01',
            '2021-04-30',
            333,
            HendelseType.Annet
        );
        await waitFor(() => {
            expect(getByText('01.01.2021–30.04.2021')).toBeInTheDocument();
        });
        expect(getByText('4 måneder')).toBeInTheDocument();
        expect(getByText('333')).toBeInTheDocument();
        expect(getByText('Rettslig grunnlag: Annet')).toBeInTheDocument();
    });

    test('Viser dager for perioder under én måned', () => {
        const { getByText } = renderPeriodeOppsummering('2021-01-15', '2021-01-31', 3333);

        expect(getByText('15.01.2021–31.01.2021')).toBeInTheDocument();
        expect(getByText('17 dager')).toBeInTheDocument();
    });

    test('Viser måned og dag for perioder over én måned', () => {
        const { getByText } = renderPeriodeOppsummering('2021-01-15', '2021-02-15', 3333);

        expect(getByText('15.01.2021–15.02.2021')).toBeInTheDocument();
        expect(getByText('1 måned og 1 dag')).toBeInTheDocument();
    });

    test('Viser måned og dager for perioder over én måned', () => {
        const { getByText } = renderPeriodeOppsummering('2021-01-15', '2021-03-10', 3333);

        expect(getByText('15.01.2021–10.03.2021')).toBeInTheDocument();
        expect(getByText('1 måned og 24 dager')).toBeInTheDocument();
    });

    test('Viser måneder og dager for perioder over én måned', () => {
        const { getByText } = renderPeriodeOppsummering('2021-01-15', '2021-04-10', 3333);

        expect(getByText('15.01.2021–10.04.2021')).toBeInTheDocument();
        expect(getByText('2 måneder og 27 dager')).toBeInTheDocument();
    });
});
