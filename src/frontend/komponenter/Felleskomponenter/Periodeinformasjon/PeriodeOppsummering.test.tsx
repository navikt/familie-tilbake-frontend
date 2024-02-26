import * as React from 'react';

import { render } from '@testing-library/react';

import PeriodeOppsummering from './PeriodeOppsummering';
import { HendelseType } from '../../../kodeverk';

describe('Tester: PeriodeOppsummering', () => {
    test('- uten hendelsetype', () => {
        const { getByText } = render(
            <PeriodeOppsummering beløp={3333} fom={'2021-01-01'} tom={'2021-05-31'} />
        );

        expect(getByText('01.01.2021 - 31.05.2021')).toBeTruthy();
        expect(getByText('5 måneder')).toBeTruthy();
        expect(getByText('3 333')).toBeTruthy();
    });

    test('- med hendelsetype', () => {
        const { getByText } = render(
            <PeriodeOppsummering
                hendelsetype={HendelseType.ANNET}
                beløp={333}
                fom={'2021-01-01'}
                tom={'2021-04-30'}
            />
        );

        expect(getByText('01.01.2021 - 30.04.2021')).toBeTruthy();
        expect(getByText('4 måneder')).toBeTruthy();
        expect(getByText('333')).toBeTruthy();
        expect(getByText('Annet')).toBeTruthy();
    });
});
