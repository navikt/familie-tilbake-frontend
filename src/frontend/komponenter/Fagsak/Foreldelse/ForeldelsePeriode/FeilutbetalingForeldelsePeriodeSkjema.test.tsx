import * as React from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { Foreldelsevurdering } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import FeilutbetalingForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';

jest.mock('@navikt/familie-http', () => {
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

describe('Tester: FeilutbetalingForeldelsePeriodeSkjema', () => {
    const behandling = mock<IBehandling>();
    const periode: ForeldelsePeriodeSkjemeData = {
        index: 'i1',
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
    };

    test('- vurderer periode ikke foreldet ', () => {
        const { getByRole, getByText, getByLabelText, queryAllByText, queryByLabelText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={periode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.click(getByLabelText('Perioden er ikke foreldet'));

        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.type(getByLabelText('Vurdering'), 'begrunnelse');

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode foreldet ', async () => {
        const { getByLabelText, getByRole, getByText, queryByLabelText, queryAllByText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={periode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        userEvent.click(getByLabelText('Perioden er foreldet'));

        expect(queryByLabelText('Foreldelsesfrist')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(getByLabelText('Vurdering'), 'begrunnelse');
        userEvent.type(getByLabelText('Foreldelsesfrist'), '2020-09-14');

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode til å bruke tilleggsfrist ', () => {
        const { getByText, getByRole, getByLabelText, queryByLabelText, queryAllByText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={periode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeFalsy();

        userEvent.click(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        );

        expect(queryByLabelText('Foreldelsesfrist')).toBeTruthy();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(3);

        userEvent.type(getByLabelText('Vurdering'), 'begrunnelse');
        userEvent.type(getByLabelText('Foreldelsesfrist'), '2020-09-14');
        userEvent.type(getByLabelText('Dato for når feilutbetaling ble oppdaget'), '2020-06-14');

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- åpner vurdert periode med tilleggsfrist ', () => {
        const vurdertPeriode: ForeldelsePeriodeSkjemeData = {
            ...periode,
            foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
            begrunnelse: 'Vurdert',
            foreldelsesfrist: '2019-12-04',
            oppdagelsesdato: '2019-09-18',
        };

        const { getByLabelText, getByText, queryByLabelText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={vurdertPeriode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeTruthy();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeTruthy();

        expect(getByLabelText('Vurdering')).toHaveValue('Vurdert');
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('04.12.2019');
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '18.09.2019'
        );
    });
});
