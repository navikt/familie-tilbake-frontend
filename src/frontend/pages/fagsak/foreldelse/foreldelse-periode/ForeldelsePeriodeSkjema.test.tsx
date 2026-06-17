import type { UserEvent } from '@testing-library/user-event';
import type { ForeldelseHook } from '@/pages/fagsak/foreldelse/ForeldelseContext';
import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagForeldelsePeriodeSkjemaData } from '@/testdata/foreldelseFactory';

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

const erPeriodenForeldetRadioGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Er perioden foreldet?',
    });
const foreldetRadio = (): HTMLElement =>
    within(erPeriodenForeldetRadioGruppe()).getByRole('radio', {
        name: 'Ja, perioden er foreldet',
    });
const ikkeForeldetRadio = (): HTMLElement =>
    within(erPeriodenForeldetRadioGruppe()).getByRole('radio', {
        name: 'Nei, perioden er ikke foreldet',
    });
const tilleggsfristRadio = (): HTMLElement =>
    within(erPeriodenForeldetRadioGruppe()).getByRole('radio', {
        name: 'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder',
    });

const foreldelsesfristDato = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Foreldelsesfrist',
    });
const oppdagelsesdatoTekst = 'Dato for når feilutbetaling ble oppdaget';
const oppdagelsesdato = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: oppdagelsesdatoTekst,
    });

describe('ForeldelsePeriodeSkjema', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    const bekreftPeriodeKnapp = (): HTMLElement =>
        screen.getByRole('button', {
            name: 'Bekreft periode',
        });

    test('Vurderer periode ikke foreldet', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.click(ikkeForeldetRadio());
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');

        await user.click(bekreftPeriodeKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode foreldet', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(screen.queryByLabelText('Foreldelsesfrist')).not.toBeInTheDocument();

        await user.click(foreldetRadio());
        expect(foreldelsesfristDato()).toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(screen.getAllByText('Du må velge en gyldig dato')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');
        await user.type(foreldelsesfristDato(), '14.09.2020');
        await user.click(bekreftPeriodeKnapp());
        expect(screen.queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Vurderer periode til å bruke tilleggsfrist', async () => {
        renderForeldelsePeriodeSkjema(lagForeldelsePeriodeSkjemaData());
        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.click(tilleggsfristRadio());
        expect(foreldelsesfristDato()).toBeInTheDocument();
        expect(oppdagelsesdato()).toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(screen.getAllByText('Du må velge en gyldig dato')).toHaveLength(2);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'begrunnelse');
        await user.type(foreldelsesfristDato(), '14.09.2020');
        await user.type(oppdagelsesdato(), '14.06.2020');

        await user.click(bekreftPeriodeKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.queryAllByText('Du må velge en gyldig dato')).toHaveLength(0);
    });

    test('Åpner vurdert periode med automatisk vurdert ikke foreldet - ikke foreldet er valgt', () => {
        renderForeldelsePeriodeSkjema(
            lagForeldelsePeriodeSkjemaData({
                foreldelsesvurderingstype: 'AUTOMATISK_VURDERT_IKKE_FORELDET',
                begrunnelse: 'Automatisk vurdert',
            })
        );

        expect(ikkeForeldetRadio()).toBeChecked();
    });

    test('Åpner vurdert periode med tilleggsfrist', () => {
        renderForeldelsePeriodeSkjema(
            lagForeldelsePeriodeSkjemaData({
                foreldelsesvurderingstype: 'TILLEGGSFRIST',
                begrunnelse: 'Vurdert',
                foreldelsesfrist: '2019-12-04',
                oppdagelsesdato: '2019-09-18',
            })
        );

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(foreldelsesfristDato()).toBeInTheDocument();
        expect(oppdagelsesdato()).toBeInTheDocument();

        expect(screen.getByLabelText('Begrunn valget over')).toHaveValue('Vurdert');
        expect(tilleggsfristRadio()).toBeChecked();
        expect(foreldelsesfristDato()).toHaveValue('04.12.2019');
        expect(oppdagelsesdato()).toHaveValue('18.09.2019');
    });
});
