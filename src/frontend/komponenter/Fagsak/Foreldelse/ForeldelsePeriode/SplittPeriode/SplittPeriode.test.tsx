import * as React from 'react';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { HttpProvider } from '@navikt/familie-http';

import { IBehandling } from '../../../../../typer/behandling';
import { ForeldelsePeriodeSkjemeData } from '../../typer/feilutbetalingForeldelse';
import SplittPeriode from './SplittPeriode';

describe('Tester: SplittPeriode - Foreldelse', () => {
    test('Tester åpning av modal', async () => {
        const user = userEvent.setup();
        const periode: ForeldelsePeriodeSkjemeData = {
            index: 'i1',
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2021-01-01',
                tom: '2021-04-30',
            },
        };
        const behandling = mock<IBehandling>({});

        const {
            getByAltText,
            getByLabelText,
            getByText,
            queryAllByText,
            queryByAltText,
            queryByText,
        } = render(
            <HttpProvider>
                <SplittPeriode periode={periode} behandling={behandling} onBekreft={jest.fn()} />
            </HttpProvider>
        );

        expect(queryByAltText('Del opp perioden')).toBeTruthy();
        expect(queryAllByText('Del opp perioden')).toHaveLength(1);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeFalsy();

        await user.click(getByAltText('Del opp perioden'));

        expect(queryAllByText('Del opp perioden')).toHaveLength(2);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeTruthy();
        expect(
            getByText('Del opp perioden', {
                selector: 'h2',
            })
        ).toBeTruthy();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toBeTruthy();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue('30.04.2021');
    });
});
