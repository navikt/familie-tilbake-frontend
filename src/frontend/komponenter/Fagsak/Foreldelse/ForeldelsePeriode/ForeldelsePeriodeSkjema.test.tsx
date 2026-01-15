import type { Http } from '../../../../api/http/HttpProvider';
import type { ForeldelseHook } from '../ForeldelseContext';
import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import ForeldelsePeriodeSkjema from './ForeldelsePeriodeSkjema';
import { BehandlingContext } from '../../../../context/BehandlingContext';
import { Foreldelsevurdering } from '../../../../kodeverk';
import { lagBehandlingContext } from '../../../../testdata/behandlingContextFactory';
import { lagForeldelsePeriodeSkjemaData } from '../../../../testdata/foreldelseFactory';

vi.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});
vi.mock('../ForeldelseContext', () => {
    return {
        useForeldelse: (): Partial<ForeldelseHook> => ({
            oppdaterPeriode: vi.fn(),
        }),
    };
});

const renderForeldelsePeriodeSkjema = (periode: ForeldelsePeriodeSkjemeData): RenderResult =>
    render(
        <BehandlingContext.Provider value={lagBehandlingContext()}>
            <ForeldelsePeriodeSkjema periode={periode} erLesevisning={false} />
        </BehandlingContext.Provider>
    );

describe('ForeldelsePeriodeSkjema', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vurderer periode ikke foreldet ', async () => {
        const { getByRole, getByText, getByLabelText, queryAllByText, queryByLabelText } =
            renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        await waitFor(() => expect(getByText('Detaljer for valgt periode')).toBeInTheDocument());
        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.click(getByLabelText('Perioden er ikke foreldet'));

        expect(queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Vurdering'), 'begrunnelse');

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode foreldet ', async () => {
        const { getByLabelText, getByRole, getByText, queryByLabelText, queryAllByText } =
            renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

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
                name: 'Bekreft periode',
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
                name: 'Bekreft periode',
            })
        );
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode til å bruke tilleggsfrist ', async () => {
        const { getByText, getByRole, getByLabelText, queryByLabelText, queryAllByText } =
            renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

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
                name: 'Bekreft periode',
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
                name: 'Bekreft periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
    });

    test('Åpner vurdert periode med tilleggsfrist ', async () => {
        const { getByLabelText, getByText, queryByLabelText } = renderForeldelsePeriodeSkjema(
            lagForeldelsePeriodeSkjemaData({
                foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
                begrunnelse: 'Vurdert',
                foreldelsesfrist: '2019-12-04',
                oppdagelsesdato: '2019-09-18',
            })
        );

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
