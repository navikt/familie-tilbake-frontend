import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { ByRoleMatcher, ByRoleOptions } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ForeldelseHook } from '~/pages/fagsak/foreldelse/ForeldelseContext';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagForeldelsePeriodeSkjemaData } from '~/testdata/foreldelseFactory';

import { ForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjema';

vi.mock('../ForeldelseContext', () => {
    return {
        useForeldelse: (): Partial<ForeldelseHook> => ({
            oppdaterPeriode: vi.fn(),
        }),
    };
});

const renderForeldelsePeriodeSkjema = (periode: ForeldelsePeriodeSkjemeData): void => {
    render(
        <TestBehandlingProvider>
            <ForeldelsePeriodeSkjema periode={periode} />
        </TestBehandlingProvider>
    );
};

describe('ForeldelsePeriodeSkjema', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    const bekreftPeriodeKnapp = (
        getByRole: (role: ByRoleMatcher, options?: ByRoleOptions | undefined) => HTMLElement
    ): HTMLElement =>
        getByRole('button', {
            name: 'Bekreft periode',
        });

    test('Vurderer periode ikke foreldet ', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.click(screen.getByLabelText('Nei, perioden er ikke foreldet'));

        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp(screen.getByRole));

        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode foreldet ', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Ja, perioden er foreldet'));

        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(screen.getAllByText('Du må velge en gyldig dato')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');
        await user.type(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            }),
            '14.09.2020'
        );

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode til å bruke tilleggsfrist ', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText('Dato for når feilutbetaling ble oppdaget')
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByLabelText(
                'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder'
            )
        );

        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Dato for når feilutbetaling ble oppdaget')
        ).toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(screen.getAllByText('Du må velge en gyldig dato')).toHaveLength(2);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');
        await user.type(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            }),
            '14.09.2020'
        );
        await user.type(
            screen.getByLabelText('Dato for når feilutbetaling ble oppdaget'),
            '14.06.2020'
        );

        await user.click(bekreftPeriodeKnapp(screen.getByRole));
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
    });

    test('Åpner vurdert periode med tilleggsfrist ', () => {
        renderForeldelsePeriodeSkjema(
            lagForeldelsePeriodeSkjemaData({
                foreldelsesvurderingstype: 'TILLEGGSFRIST',
                begrunnelse: 'Vurdert',
                foreldelsesfrist: '2019-12-04',
                oppdagelsesdato: '2019-09-18',
            })
        );

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Dato for når feilutbetaling ble oppdaget')
        ).toBeInTheDocument();

        expect(screen.getByLabelText('Begrunn valget over')).toHaveValue('Vurdert');
        expect(
            screen.getByLabelText(
                'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder'
            )
        ).toBeChecked();
        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('04.12.2019');
        expect(screen.getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '18.09.2019'
        );
    });
});
