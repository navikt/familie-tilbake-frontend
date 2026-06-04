import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '@/api/behandling';
import type { BehandlingDto } from '@/generated';
import type { Ressurs } from '@/typer/ressurs';
import type { ForeldelsePeriode, ForeldelseResponse } from '@/typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '@/context/FagsakContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { lagForeldelsePeriode, lagForeldelseResponse } from '@/testdata/foreldelseFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';
import { RessursStatus } from '@/typer/ressurs';

import { ForeldelseContainer } from './ForeldelseContainer';
import { ForeldelseProvider } from './ForeldelseContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('@/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderForeldelseContainer = ({
    behandling = lagBehandling(),
    behandlet = false,
    lesemodus = false,
    autoutført = false,
}: {
    behandling?: BehandlingDto;
    behandlet?: boolean;
    lesemodus?: boolean;
    autoutført?: boolean;
}): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{
                        behandlingILesemodus: lesemodus,
                        erStegBehandlet: (): boolean => behandlet,
                        erStegAutoutført: (): boolean => autoutført,
                    }}
                >
                    <ForeldelseProvider>
                        <ForeldelseContainer />
                    </ForeldelseProvider>
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

const foreldelsesperioder = [
    lagForeldelsePeriode({
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
    }),
    lagForeldelsePeriode({
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
    }),
];

const setupMock = (foreldelse: ForeldelseResponse): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerForeldelseKall: (): Promise<Ressurs<ForeldelseResponse>> => {
            const ressurs: Ressurs<ForeldelseResponse> = {
                status: RessursStatus.Suksess,
                data: foreldelse,
            };
            return Promise.resolve(ressurs);
        },
        sendInnForeldelse: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

const førsteVurdertePeriode: ForeldelsePeriode = {
    ...foreldelsesperioder[0],
    begrunnelse: 'Begrunnelse 1',
    foreldelsesvurderingstype: 'FORELDET',
    foreldelsesfrist: '2021-01-01',
} satisfies ForeldelsePeriode;

const andreVurdertePeriode: ForeldelsePeriode = {
    ...foreldelsesperioder[1],
    begrunnelse: 'Begrunnelse 2',
    foreldelsesvurderingstype: 'TILLEGGSFRIST',
    foreldelsesfrist: '2021-01-01',
    oppdagelsesdato: '2020-12-24',
} satisfies ForeldelsePeriode;

const gåTilbakeKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Gå tilbake til faktasteget' });

const gåVidereTekst = { name: 'Gå videre til vilkårsvurderingssteget' };
const gåVidereKnapp = (): HTMLElement => screen.getByRole('button', gåVidereTekst);

const lagreTekst = { name: 'Lagre og gå videre til vilkårsvurderingssteget' };
const lagreOgGåVidereKnapp = (): HTMLElement => screen.getByRole('button', lagreTekst);
const lagreOgGåTilbakeTekst = { name: 'Lagre og gå tilbake til faktasteget' };
const bekreftPeriodeTekst = { name: 'Bekreft periode' };
const bekreftPeriodeKnapp = (): HTMLElement => screen.getByRole('button', bekreftPeriodeTekst);

const foreldetTekst = { name: /Er perioden foreldet/i };
const foreldetRadioGroup = (): HTMLElement => screen.getByRole('radiogroup', foreldetTekst);

const jaForeldetRadio = (): HTMLElement =>
    within(foreldetRadioGroup()).getByRole('radio', { name: 'Ja, perioden er foreldet' });
const neiForeldetRadio = (): HTMLElement =>
    within(foreldetRadioGroup()).getByRole('radio', { name: 'Nei, perioden er ikke foreldet' });

const neiTilleggsfristRadio = (): HTMLElement =>
    within(foreldetRadioGroup()).getByRole('radio', {
        name: 'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder',
    });

const begrunnBoks = {
    name: 'Begrunn valget over',
};
const begrunnelseTekstfelt = (): HTMLElement => screen.getByRole('textbox', begrunnBoks);

const førstePeriodeKnappeTekst = {
    name: 'Advarsel fra 01.01.2020 til 31.03.2020',
};
const andrePeriodeKnappeTekst = {
    name: 'Suksess fra 01.05.2020 til 30.06.2020',
};
const førstePeriodeValgt = (): HTMLElement => screen.getByText('01.01.2020–31.03.2020');
const andrePeriodeValgt = (): HTMLElement => screen.getByText('01.05.2020–30.06.2020');

const oppdagelsesdato = (): HTMLElement =>
    screen.getByLabelText('Dato for når feilutbetaling ble oppdaget');
const foreldelsesfrist = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Foreldelsesfrist' });

describe('ForeldelseContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut perioder og send inn', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: foreldelsesperioder }));
        renderForeldelseContainer({});

        expect(await screen.findByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(førstePeriodeValgt()).toBeInTheDocument();

        expect(gåVidereKnapp()).toBeDisabled();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(begrunnelseTekstfelt(), 'Begrunnelse 1');
        await user.click(neiForeldetRadio());

        await user.click(bekreftPeriodeKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(lagreOgGåVidereKnapp()).toBeDisabled();

        expect(andrePeriodeValgt()).toBeInTheDocument();

        await user.click(bekreftPeriodeKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(begrunnelseTekstfelt(), 'Begrunnelse 2');
        await user.click(neiForeldetRadio());
        await user.click(bekreftPeriodeKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();

        expect(lagreOgGåVidereKnapp()).toBeEnabled();

        await user.click(lagreOgGåVidereKnapp());
    });

    test('Vis utfylt', async () => {
        const foreldelseResponse = lagForeldelseResponse({
            foreldetPerioder: [førsteVurdertePeriode, andreVurdertePeriode],
        });
        setupMock(foreldelseResponse);

        renderForeldelseContainer({ behandlet: true });

        await user.click(await screen.findByRole('button', førstePeriodeKnappeTekst));

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(førstePeriodeValgt()).toBeInTheDocument();
        expect(jaForeldetRadio()).toBeChecked();
        expect(begrunnelseTekstfelt()).toHaveValue('Begrunnelse 1');
        expect(foreldelsesfrist()).toHaveValue('01.01.2021');

        await user.click(screen.getByRole('button', andrePeriodeKnappeTekst));

        expect(andrePeriodeValgt()).toBeInTheDocument();
        expect(begrunnelseTekstfelt()).toHaveValue('Begrunnelse 2');
        expect(neiTilleggsfristRadio()).toBeChecked();
        expect(foreldelsesfrist()).toHaveValue('01.01.2021');
        expect(oppdagelsesdato()).toHaveValue('24.12.2020');
    });

    test('Vis utfylt - lesevisning', async () => {
        setupMock({
            foreldetPerioder: [
                {
                    ...foreldelsesperioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: 'FORELDET',
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...foreldelsesperioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: 'TILLEGGSFRIST',
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });

        renderForeldelseContainer({
            behandling: lagBehandling({ status: 'FATTER_VEDTAK' }),
            behandlet: true,
            lesemodus: true,
        });

        expect(await screen.findByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(førstePeriodeValgt()).toBeInTheDocument();
        expect(begrunnelseTekstfelt()).toHaveValue('Begrunnelse 1');
        expect(jaForeldetRadio()).toBeChecked();
        expect(foreldelsesfrist()).toHaveValue('01.01.2021');

        expect(screen.getByRole('button', førstePeriodeKnappeTekst)).toBeInTheDocument();
        expect(screen.getByRole('button', andrePeriodeKnappeTekst)).toBeInTheDocument();

        expect(gåTilbakeKnapp()).toBeEnabled();
        expect(gåVidereKnapp()).toBeEnabled();

        await user.click(screen.getByRole('button', andrePeriodeKnappeTekst));

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(andrePeriodeValgt()).toBeInTheDocument();
        expect(begrunnelseTekstfelt()).toHaveValue('Begrunnelse 2');
        expect(neiTilleggsfristRadio()).toBeChecked();
        expect(oppdagelsesdato()).toHaveValue('24.12.2020');
        expect(foreldelsesfrist()).toHaveValue('01.01.2021');

        expect(screen.getByRole('button', førstePeriodeKnappeTekst)).toBeInTheDocument();
        expect(screen.getByRole('button', andrePeriodeKnappeTekst)).toBeInTheDocument();

        expect(gåTilbakeKnapp()).toBeEnabled();
        expect(gåVidereKnapp()).toBeEnabled();
    });

    test('Vis autoutført', () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: [] }));
        renderForeldelseContainer({ autoutført: true });

        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        const automatiskTekst =
            'Perioden blir automatisk vurdert dersom det er mer enn 6 måneder til den er foreldet.';
        expect(screen.getByText(automatiskTekst)).toBeInTheDocument();
    });

    test('Viser vurdert periode som standard', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: [førsteVurdertePeriode] }));
        renderForeldelseContainer({ behandlet: true });

        expect(await screen.findByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(førstePeriodeValgt()).toBeInTheDocument();
    });

    test('Vurderte perioder viser siste vurderte periode', async () => {
        const foreldelseResponse = lagForeldelseResponse({
            foreldetPerioder: [førsteVurdertePeriode, andreVurdertePeriode],
        });
        setupMock(foreldelseResponse);
        renderForeldelseContainer({ behandlet: true });

        expect(await screen.findByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(andrePeriodeValgt()).toBeInTheDocument();
    });

    test('Skal vise "Neste"-knapp etter bekreft uten endring', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: [førsteVurdertePeriode] }));
        renderForeldelseContainer({ behandlet: true });
        await user.click(await screen.findByRole('button', bekreftPeriodeTekst));
        expect(gåVidereKnapp()).toBeInTheDocument();
    });

    describe('Knappetekst på neste/forrige', () => {
        const ikkeForeldetPeriode = {
            ...foreldelsesperioder[0],
            begrunnelse: 'Begrunnelse 1',
            foreldelsesvurderingstype: 'IKKE_FORELDET',
        } satisfies ForeldelsePeriode;

        test('Autoutført steg uten vurdering viser Neste/Forrige', () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [] }));
            renderForeldelseContainer({ autoutført: true });

            expect(gåVidereKnapp()).toBeInTheDocument();
            expect(gåTilbakeKnapp()).toBeInTheDocument();
        });

        test('Uvurdert steg viser Lagre-tekst når bruker vurderer en periode', async () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [foreldelsesperioder[0]] }));
            renderForeldelseContainer({});

            expect(await screen.findByRole('textbox', begrunnBoks)).toBeInTheDocument();

            await user.type(begrunnelseTekstfelt(), 'Begrunnelse');
            await user.click(neiForeldetRadio());
            await user.click(bekreftPeriodeKnapp());

            expect(lagreOgGåVidereKnapp()).toBeInTheDocument();
            expect(screen.getByRole('button', lagreOgGåTilbakeTekst)).toBeInTheDocument();
        });

        test('Vurdert steg med vurdert periode uten endringer viser Neste/Forrige', async () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [ikkeForeldetPeriode] }));
            renderForeldelseContainer({ behandlet: true });

            expect(await screen.findByRole('button', gåVidereTekst)).toBeInTheDocument();
            expect(gåTilbakeKnapp()).toBeInTheDocument();
        });
    });
});
