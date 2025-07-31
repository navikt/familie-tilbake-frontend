import type { IBehandling } from '../../../../typer/behandling';
import type { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import FeilutbetalingForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';
import { Foreldelsevurdering } from '../../../../kodeverk';

jest.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});
jest.mock('../FeilutbetalingForeldelseContext', () => {
    return {
        useFeilutbetalingForeldelse: () => ({
            oppdaterPeriode: jest.fn(),
            onSplitPeriode: jest.fn(),
            lukkValgtPeriode: jest.fn(),
        }),
    };
});

jest.mock('../../../../context/BehandlingContext', () => {
    return {
        useBehandling: () => ({
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersistertKomponent: jest.fn(),
        }),
    };
});
const behandling = mock<IBehandling>();
const periode: ForeldelsePeriodeSkjemeData = {
    index: 'i1',
    feilutbetaltBeløp: 1333,
    periode: {
        fom: '2021-01-01',
        tom: '2021-04-30',
    },
};

const renderFeilutbetalingForeldelsePeriodeSkjema = (
    behandling: IBehandling,
    periode: ForeldelsePeriodeSkjemeData
) =>
    render(
        <FeilutbetalingForeldelsePeriodeSkjema
            behandling={behandling}
            periode={periode}
            erLesevisning={false}
        />
    );

describe('Tester: FeilutbetalingForeldelsePeriodeSkjema', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });
    test('- vurderer periode ikke foreldet ', async () => {
        const { getByRole, getByText, getByLabelText, queryAllByText, queryByLabelText } =
            renderFeilutbetalingForeldelsePeriodeSkjema(behandling, periode);

        await waitFor(() => expect(getByText('Detaljer for valgt periode')).toBeInTheDocument());
        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.click(getByLabelText('Perioden er ikke foreldet'));

        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Vurdering'), 'begrunnelse');

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode foreldet ', async () => {
        const { getByLabelText, getByRole, getByText, queryByLabelText, queryAllByText } =
            renderFeilutbetalingForeldelsePeriodeSkjema(behandling, periode);

        await waitFor(() => expect(getByText('Detaljer for valgt periode')).toBeInTheDocument());
        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(getByLabelText('Perioden er foreldet'));

        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(1);

        await user.type(getByLabelText('Vurdering'), 'begrunnelse');
        await user.type(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            }),
            '14.09.2020'
        );

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode til å bruke tilleggsfrist ', async () => {
        const { getByText, getByRole, getByLabelText, queryByLabelText, queryAllByText } =
            renderFeilutbetalingForeldelsePeriodeSkjema(behandling, periode);

        await waitFor(() => expect(getByText('Detaljer for valgt periode')).toBeInTheDocument());
        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();
        expect(
            queryByLabelText('Dato for når feilutbetaling ble oppdaget')
        ).not.toBeInTheDocument();

        await user.click(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        );

        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(2);

        await user.type(getByLabelText('Vurdering'), 'begrunnelse');
        await user.type(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            }),
            '14.09.2020'
        );
        await user.type(getByLabelText('Dato for når feilutbetaling ble oppdaget'), '14.06.2020');

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
    });

    test('- åpner vurdert periode med tilleggsfrist ', async () => {
        const vurdertPeriode: ForeldelsePeriodeSkjemeData = {
            ...periode,
            foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
            begrunnelse: 'Vurdert',
            foreldelsesfrist: '2019-12-04',
            oppdagelsesdato: '2019-09-18',
        };

        const { getByLabelText, getByText, queryByLabelText } =
            renderFeilutbetalingForeldelsePeriodeSkjema(behandling, vurdertPeriode);

        await waitFor(() => expect(getByText('Detaljer for valgt periode')).toBeInTheDocument());
        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeInTheDocument();

        expect(getByLabelText('Vurdering')).toHaveValue('Vurdert');
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        ).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('04.12.2019');
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '18.09.2019'
        );
    });
});
