import type { RenderResult } from '@testing-library/react';

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { PeriodeOppsummering } from './PeriodeOppsummering';
import { HendelseType } from '../../../kodeverk';

const renderPeriodeOppsummering = (
    tom: string,
    beløp: number,
    hendelsestype?: HendelseType
): RenderResult =>
    render(
        <PeriodeOppsummering
            hendelsetype={hendelsestype}
            beløp={beløp}
            fom="2021-01-01"
            tom={tom}
        />
    );

describe('PeriodeOppsummering', () => {
    test('Uten hendelsetype', () => {
        const { getByText } = renderPeriodeOppsummering('2021-05-31', 3333);
        expect(getByText('01.01.2021 - 31.05.2021')).toBeInTheDocument();
        expect(getByText('5 måneder')).toBeInTheDocument();
        expect(getByText('3 333')).toBeInTheDocument();
    });

    test('Med hendelsetype', async () => {
        const { getByText } = renderPeriodeOppsummering('2021-04-30', 333, HendelseType.Annet);
        await waitFor(() => {
            expect(getByText('01.01.2021 - 30.04.2021')).toBeInTheDocument();
        });
        expect(getByText('4 måneder')).toBeInTheDocument();
        expect(getByText('333')).toBeInTheDocument();
        expect(getByText('Annet')).toBeInTheDocument();
    });
});
