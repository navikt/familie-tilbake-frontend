import type { IBehandling } from '../../../../typer/behandling';
import type { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';

import { act, render } from '@testing-library/react';
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

    test('- vurderer periode ikke foreldet ', async () => {
        const user = userEvent.setup();
        const { getByRole, getByText, getByLabelText, queryAllByText, queryByLabelText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={periode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() => user.click(getByLabelText('Perioden er ikke foreldet')));

        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await act(() => user.type(getByLabelText('Vurdering'), 'begrunnelse'));

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode foreldet ', async () => {
        const user = userEvent.setup();
        const { getByLabelText, getByRole, getByText, queryByLabelText, queryAllByText } = render(
            <FeilutbetalingForeldelsePeriodeSkjema
                behandling={behandling}
                periode={periode}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByLabelText('Foreldelsesfrist')).toBeFalsy();

        await act(() => user.click(getByLabelText('Perioden er foreldet')));

        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(1);

        await act(() => user.type(getByLabelText('Vurdering'), 'begrunnelse'));
        await act(() =>
            user.type(
                getByLabelText('Foreldelsesfrist', {
                    selector: 'input',
                    exact: false,
                }),
                '14.09.2020'
            )
        );

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- vurderer periode til å bruke tilleggsfrist ', async () => {
        const user = userEvent.setup();
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

        await act(() =>
            user.click(
                getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
            )
        );

        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeTruthy();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(2);

        await act(() => user.type(getByLabelText('Vurdering'), 'begrunnelse'));
        await act(() =>
            user.type(
                getByLabelText('Foreldelsesfrist', {
                    selector: 'input',
                    exact: false,
                }),
                '14.09.2020'
            )
        );
        await act(() =>
            user.type(getByLabelText('Dato for når feilutbetaling ble oppdaget'), '14.06.2020')
        );

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
    });

    test('- åpner vurdert periode med tilleggsfrist ', () => {
        const vurdertPeriode: ForeldelsePeriodeSkjemeData = {
            ...periode,
            foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
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
        expect(
            queryByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeTruthy();
        expect(queryByLabelText('Dato for når feilutbetaling ble oppdaget')).toBeTruthy();

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
