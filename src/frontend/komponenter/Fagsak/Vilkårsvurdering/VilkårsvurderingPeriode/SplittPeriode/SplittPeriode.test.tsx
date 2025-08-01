import type { IBehandling } from '../../../../../typer/behandling';
import type { VilkårsvurderingPeriodeSkjemaData } from '../../typer/feilutbetalingVilkårsvurdering';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import SplittPeriode from './SplittPeriode';
import { HttpProvider } from '../../../../../api/http/HttpProvider';
import { HendelseType } from '../../../../../kodeverk';

describe('Tester: SplittPeriode - Vilkårsvurdering', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });
    test('Tester åpning av modal', async () => {
        const periode: VilkårsvurderingPeriodeSkjemaData = {
            hendelsestype: HendelseType.Annet,
            index: 'i1',
            foreldet: false,
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

        expect(queryByAltText('Del opp perioden')).toBeInTheDocument();
        expect(queryAllByText('Del opp perioden')).toHaveLength(1);
        expect(queryByText('01.01.2021 - 30.04.2021')).not.toBeInTheDocument();

        await user.click(getByAltText('Del opp perioden'));

        expect(queryAllByText('Del opp perioden')).toHaveLength(2);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeInTheDocument();
        expect(
            getByText('Del opp perioden', {
                selector: 'p',
            })
        ).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue('april 2021');
    });
});
