import type { UserEvent } from '@testing-library/user-event';
import type { AxiosResponse } from 'axios';
import type { EndretKravgrunnlag } from '@/generated';
import type { FaktaOmFeilutbetaling, FaktaPeriode, KravgrunnlagForskjell } from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AxiosError } from 'axios';

import { FagsakContext } from '@/context/FagsakContext';
import { behandlingFaktaQueryKey } from '@/generated-new/@tanstack/react-query.gen';
import { behandlingBenyttNyesteKravgrunnlag, behandlingFakta } from '@/generated-new/sdk.gen';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { NyttKravgrunnlagModal } from './NyttKravgrunnlagModal';

vi.mock('@/generated-new/sdk.gen', async importOriginal => ({
    ...(await importOriginal<typeof import('@/generated-new/sdk.gen')>()),
    behandlingBenyttNyesteKravgrunnlag: vi.fn(),
    behandlingFakta: vi.fn(),
}));

const benyttNyesteKravgrunnlagMock = vi.mocked(behandlingBenyttNyesteKravgrunnlag);
const behandlingFaktaMock = vi.mocked(behandlingFakta);

const lagAxiosFeil = (data?: { tittel: string; melding: string }): AxiosError => {
    const feil = new AxiosError('Kallet feilet');
    if (data) {
        feil.response = { status: 500, data } as AxiosResponse;
    }
    return feil;
};

const lagVellykketSvar = <T,>(data: T): never => ({ data }) as never;

type NyPeriode = Extract<KravgrunnlagForskjell, { type: 'ny_periode' }>;
type EndretPeriode = Extract<KravgrunnlagForskjell, { type: 'endret_periode' }>;
type FjernetPeriode = Extract<KravgrunnlagForskjell, { type: 'fjernet_periode' }>;

const varighetsdifferanse = /^[+–].*(dag|måned|år)/;
const fargeattributt = 'data-color';

const hentOverskrift = (navn: string, nivå: number = 2): HTMLElement =>
    screen.getByRole('heading', { name: navn, level: nivå });

const finnOverskrift = (navn: string, nivå: number = 2): Promise<HTMLElement> =>
    screen.findByRole('heading', { name: navn, level: nivå });

const søkEtterOverskrift = (navn: string): HTMLElement | null =>
    screen.queryByRole('heading', { name: navn });

const finnBoks = async (navn: string): Promise<ReturnType<typeof within>> =>
    within(await screen.findByRole('region', { name: navn }));

const finnFeilvarsel = async (tittel: string): Promise<ReturnType<typeof within>> => {
    const overskrift = await screen.findByRole('heading', { name: `Feil: ${tittel}` });
    const varsel = overskrift.closest('section');
    if (!varsel) throw new Error(`Fant ikke varsel med tittel ${tittel}`);
    return within(varsel);
};

const lagNyPeriode = (overrides: Partial<NyPeriode> = {}): NyPeriode =>
    ({
        type: 'ny_periode',
        fom: '2026-09-21',
        tom: '2026-09-27',
        beløp: 10000,
        ...overrides,
    }) satisfies NyPeriode;

const lagEndretPeriode = (overrides: Partial<EndretPeriode> = {}): EndretPeriode =>
    ({
        type: 'endret_periode',
        fom: '2026-08-10',
        tom: '2026-08-24',
        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-10' },
        gammeltBeløp: 5000,
        nyttBeløp: 20000,
        ...overrides,
    }) satisfies EndretPeriode;

const lagFjernetPeriode = (overrides: Partial<FjernetPeriode> = {}): FjernetPeriode =>
    ({
        type: 'fjernet_periode',
        fom: '2024-01-01',
        tom: '2024-12-31',
        beløp: 55000,
        ...overrides,
    }) satisfies FjernetPeriode;

type EndretKravgrunnlagModalData = Omit<EndretKravgrunnlag, 'endringer'> & {
    endringer: KravgrunnlagForskjell[];
};

const lagEndretKravgrunnlag = (
    overrides: Partial<EndretKravgrunnlagModalData> = {}
): EndretKravgrunnlagModalData =>
    ({
        gammeltBeløp: 10000,
        nyttBeløp: 15000,
        gammelPeriode: {
            fom: '2024-01-01',
            tom: '2024-06-30',
            fomMåned: '2024-01',
            tomMåned: '2024-06',
        },
        nyPeriode: {
            fom: '2024-01-01',
            tom: '2024-01-31',
            fomMåned: '2024-01',
            tomMåned: '2024-01',
        },
        endringer: [lagEndretPeriode()],
        ...overrides,
    }) satisfies EndretKravgrunnlagModalData;

const lagFakta = (perioder: FaktaPeriode[]): FaktaOmFeilutbetaling => ({
    feilutbetaling: {
        beløp: 15000,
        fom: '2024-01-01',
        tom: '2026-12-31',
        revurdering: {
            årsak: 'Ukjent',
            vedtaksdato: '2026-01-01',
            resultat: 'INNVILGET',
        },
    },
    tidligereVarsletBeløp: null,
    muligeRettsligGrunnlag: [],
    perioder,
    ferdigvurdert: false,
    status4xRettsgebyret: 'OVER',
    rettsgebyrÅrFraSaksbehandler: null,
    vurdering: { årsak: null, oppdaget: undefined },
});

type RenderValg = {
    erNyModell?: boolean;
    lukkModal?: () => void;
};

const renderModal = (
    endretKravgrunnlag: EndretKravgrunnlagModalData = lagEndretKravgrunnlag(),
    perioder?: FaktaPeriode[],
    { erNyModell = false, lukkModal = vi.fn() }: RenderValg = {}
): void => {
    const queryClient = createTestQueryClient();
    if (perioder) {
        queryClient.setQueryData<FaktaOmFeilutbetaling>(
            behandlingFaktaQueryKey({ path: { behandlingId: 'uuid-1' } }),
            lagFakta(perioder)
        );
    }
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={lagBehandling({ erNyModell })}>
                    <NyttKravgrunnlagModal
                        endretKravgrunnlag={endretKravgrunnlag}
                        lukkModal={lukkModal}
                    />
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

const lagFaktaPeriode = (overrides: Partial<FaktaPeriode> = {}): FaktaPeriode => ({
    id: 'uendret-1',
    fom: '2025-01-01',
    tom: '2025-01-31',
    feilutbetaltBeløp: 5000,
    splittbarePerioder: [],
    rettsligGrunnlag: [],
    ...overrides,
});

describe('NyttKravgrunnlagModal', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        benyttNyesteKravgrunnlagMock.mockReset();
        behandlingFaktaMock.mockReset();
    });

    test.each([
        {
            tilfelle: 'kun en ny periode',
            endringer: [lagNyPeriode()],
            beskrivelse: 'Det er registrert en ny periode i kravgrunnlaget som må vurderes.',
        },
        {
            tilfelle: 'kun flere nye perioder',
            endringer: [lagNyPeriode(), lagNyPeriode({ fom: '2026-10-01', tom: '2026-10-31' })],
            beskrivelse: 'Det er registrert flere nye perioder i kravgrunnlaget som må vurderes.',
        },
        {
            tilfelle: 'kun en fjernet periode',
            endringer: [lagFjernetPeriode()],
            beskrivelse:
                'Det er registrert at en periode er fjernet i kravgrunnlaget, og du må vurdere på nytt.',
        },
        {
            tilfelle: 'kun flere fjernede perioder',
            endringer: [
                lagFjernetPeriode(),
                lagFjernetPeriode({ fom: '2025-01-01', tom: '2025-12-31' }),
            ],
            beskrivelse:
                'Det er registrert at flere perioder er fjernet i kravgrunnlaget, og du må vurdere på nytt.',
        },
    ])('Viser riktig beskrivelse for $tilfelle', async ({ endringer, beskrivelse }) => {
        renderModal(lagEndretKravgrunnlag({ endringer }));

        expect(await screen.findByText(beskrivelse)).toBeInTheDocument();
    });

    test.each([
        { tilfelle: 'ingen perioder', endringer: [] },
        { tilfelle: 'kun endret periode', endringer: [lagEndretPeriode()] },
        {
            tilfelle: 'kun flere endrede perioder',
            endringer: [
                lagEndretPeriode(),
                lagEndretPeriode({ fom: '2026-09-01', tom: '2026-09-30' }),
            ],
        },
        {
            tilfelle: 'nye og fjernede perioder',
            endringer: [lagNyPeriode(), lagFjernetPeriode()],
        },
        {
            tilfelle: 'nye og endrede perioder',
            endringer: [lagNyPeriode(), lagEndretPeriode()],
        },
        {
            tilfelle: 'fjernede og endrede perioder',
            endringer: [lagFjernetPeriode(), lagEndretPeriode()],
        },
        {
            tilfelle: 'nye, fjernede og endrede perioder',
            endringer: [lagNyPeriode(), lagFjernetPeriode(), lagEndretPeriode()],
        },
    ])('Viser generell beskrivelse for $tilfelle', async ({ endringer }) => {
        renderModal(lagEndretKravgrunnlag({ endringer }));

        expect(
            await screen.findByText(
                'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.'
            )
        ).toBeInTheDocument();
        expect(hentOverskrift('Endringer i kravgrunnlaget', 1)).toBeInTheDocument();
    });

    test('Viser kort for endring i eksisterende periode', async () => {
        renderModal();

        expect(await finnOverskrift('Endringer i kravgrunnlaget', 1)).toBeInTheDocument();
        expect(hentOverskrift('Endringer')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–10.08.2026')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–24.08.2026')).toBeInTheDocument();
        expect(screen.getByText('Før')).toBeInTheDocument();
        expect(screen.getByText('Etter endring')).toBeInTheDocument();
        expect(screen.getByText('5 000 kr')).toBeInTheDocument();
        expect(screen.getByText('20 000 kr')).toBeInTheDocument();
        expect(søkEtterOverskrift('Lagt til')).not.toBeInTheDocument();
    });

    test('Uendret periode og endret beløp: viser begge kolonner, kun beløpsdifferanse', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-24' },
                    }),
                ],
            })
        );

        expect(await finnOverskrift('Endringer')).toBeInTheDocument();
        expect(screen.getAllByText('10.08.2026–24.08.2026')).toHaveLength(2);
        expect(screen.getByText('5 000 kr')).toBeInTheDocument();
        expect(screen.getByText('20 000 kr')).toBeInTheDocument();
        expect(screen.getByText('+15 000 kr')).toHaveAttribute(fargeattributt, 'success');
        expect(screen.queryByText(varighetsdifferanse)).not.toBeInTheDocument();
    });

    test('Endret periode og uendret beløp: viser begge kolonner, kun varighetsdifferanse', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        tom: '2026-08-31',
                        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-24' },
                        nyttBeløp: 5000,
                    }),
                ],
            })
        );

        expect(await finnOverskrift('Endringer')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–24.08.2026')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–31.08.2026')).toBeInTheDocument();
        expect(screen.getAllByText('5 000 kr')).toHaveLength(2);
        expect(screen.getByText('+7 dager')).toHaveAttribute(fargeattributt, 'success');
        expect(screen.queryByText(/^[+–].* kr$/)).not.toBeInTheDocument();
    });

    test.each([
        {
            tilfelle: 'kortere periode og lavere beløp',
            gammelPeriode: { fom: '2026-01-01', tom: '2026-04-30' },
            fom: '2026-01-01',
            tom: '2026-02-28',
            nyttBeløp: 10000,
            varighetsendring: '–2 måneder',
            beløpsendring: '–5 000 kr',
            farge: 'danger',
        },
        {
            tilfelle: 'lengre periode og høyere beløp',
            gammelPeriode: { fom: '2026-01-01', tom: '2026-02-28' },
            fom: '2026-01-01',
            tom: '2026-04-30',
            nyttBeløp: 120000,
            varighetsendring: '+2 måneder',
            beløpsendring: '+105 000 kr',
            farge: 'success',
        },
        {
            tilfelle: 'én måned kortere',
            gammelPeriode: { fom: '2026-01-01', tom: '2026-04-30' },
            fom: '2026-01-01',
            tom: '2026-03-31',
            nyttBeløp: 10000,
            varighetsendring: '–1 måned',
            beløpsendring: '–5 000 kr',
            farge: 'danger',
        },
        {
            tilfelle: 'én dag lengre',
            gammelPeriode: { fom: '2026-08-10', tom: '2026-08-24' },
            fom: '2026-08-10',
            tom: '2026-08-25',
            nyttBeløp: 16000,
            varighetsendring: '+1 dag',
            beløpsendring: '+1 000 kr',
            farge: 'success',
        },
        {
            tilfelle: 'ett år lengre',
            gammelPeriode: { fom: '2025-01-01', tom: '2025-12-31' },
            fom: '2025-01-01',
            tom: '2026-12-31',
            nyttBeløp: 16000,
            varighetsendring: '+1 år',
            beløpsendring: '+1 000 kr',
            farge: 'success',
        },
    ])(
        'Viser differanser med fortegn og farge for $tilfelle',
        async ({ gammelPeriode, fom, tom, nyttBeløp, varighetsendring, beløpsendring, farge }) => {
            renderModal(
                lagEndretKravgrunnlag({
                    endringer: [
                        lagEndretPeriode({
                            gammelPeriode,
                            fom,
                            tom,
                            gammeltBeløp: 15000,
                            nyttBeløp,
                        }),
                    ],
                })
            );

            const boks = await finnBoks('Endringer');
            expect(boks.getByText('Før')).toBeInTheDocument();
            expect(boks.getByText('Etter endring')).toBeInTheDocument();
            expect(boks.getByText('15 000 kr')).toBeInTheDocument();
            expect(boks.getByText(varighetsendring)).toHaveAttribute(fargeattributt, farge);
            expect(boks.getByText(beløpsendring)).toHaveAttribute(fargeattributt, farge);
        }
    );

    test('Flyttet periode med samme kalenderlengde viser ingen varighetsdifferanse', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        gammelPeriode: { fom: '2026-01-01', tom: '2026-01-31' },
                        fom: '2026-02-01',
                        tom: '2026-02-28',
                    }),
                ],
            })
        );

        const boks = await finnBoks('Endringer');
        expect(boks.getAllByText('1 måned')).toHaveLength(2);
        expect(boks.queryByText(varighetsdifferanse)).not.toBeInTheDocument();
    });

    test('Uendret varighet og beløp står alene uten differanse-tagger', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        gammelPeriode: { fom: '2026-01-01', tom: '2026-01-31' },
                        fom: '2026-02-01',
                        tom: '2026-02-28',
                        nyttBeløp: 5000,
                    }),
                ],
            })
        );

        const boks = await finnBoks('Endringer');
        expect(boks.getAllByText('1 måned')).toHaveLength(2);
        expect(boks.getAllByText('5 000 kr')).toHaveLength(2);
        expect(boks.queryByText(/^[+–]/)).not.toBeInTheDocument();
    });

    test('Viser kun kort for ny periode når det bare er en ny periode', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagNyPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'Ny periode må vurderes', level: 1 })
        ).toBeInTheDocument();
        expect(hentOverskrift('Lagt til')).toBeInTheDocument();
        expect(screen.getByText('21.09.2026–27.09.2026')).toBeInTheDocument();
        expect(screen.getByText('10 000')).toBeInTheDocument();
        expect(søkEtterOverskrift('Endringer')).not.toBeInTheDocument();
    });

    test('Viser kun kort for fjernet periode når det bare er en fjernet periode', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagFjernetPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'En periode er fjernet', level: 1 })
        ).toBeInTheDocument();
        expect(hentOverskrift('Fjernet')).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–31.12.2024')).toBeInTheDocument();
        expect(screen.getByText('1 år')).toBeInTheDocument();
        expect(screen.getByText('55 000')).toBeInTheDocument();
        expect(søkEtterOverskrift('Lagt til')).not.toBeInTheDocument();
    });

    test('Viser begge kortene når det er både ny periode og endring i eksisterende', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagNyPeriode(), lagEndretPeriode()] }));

        expect(await finnOverskrift('Endringer i kravgrunnlaget', 1)).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.'
            )
        ).toBeInTheDocument();
        expect(hentOverskrift('Lagt til')).toBeInTheDocument();
        expect(hentOverskrift('Endringer')).toBeInTheDocument();
    });

    test('Viser fjernet, ny og endret periode', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [lagFjernetPeriode(), lagNyPeriode(), lagEndretPeriode()],
            })
        );

        expect(await finnOverskrift('Endringer i kravgrunnlaget', 1)).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.'
            )
        ).toBeInTheDocument();
        expect(hentOverskrift('Fjernet')).toBeInTheDocument();
        expect(hentOverskrift('Lagt til')).toBeInTheDocument();
        expect(hentOverskrift('Endringer')).toBeInTheDocument();
    });

    test.each([
        { tittel: 'Lagt til', lagPeriode: lagNyPeriode },
        { tittel: 'Fjernet', lagPeriode: lagFjernetPeriode },
    ])(
        'Samler flere perioder i boksen $tittel med skillelinjer',
        async ({ tittel, lagPeriode }) => {
            renderModal(
                lagEndretKravgrunnlag({
                    endringer: [
                        lagPeriode({ fom: '2026-01-01', tom: '2026-01-31', beløp: 10000 }),
                        lagPeriode({ fom: '2026-02-01', tom: '2026-02-28', beløp: 20000 }),
                        lagPeriode({ fom: '2026-03-01', tom: '2026-03-31', beløp: 30000 }),
                    ],
                })
            );

            const boks = await finnBoks(tittel);
            expect(boks.getAllByRole('heading', { name: tittel, level: 2 })).toHaveLength(1);
            expect(boks.getAllByText('Periode')).toHaveLength(1);
            expect(boks.getAllByText('Feilutbetalt')).toHaveLength(1);
            expect(boks.getAllByRole('separator')).toHaveLength(2);
            expect(boks.getByText('01.01.2026–31.01.2026')).toBeInTheDocument();
            expect(boks.getByText('01.02.2026–28.02.2026')).toBeInTheDocument();
            expect(boks.getByText('01.03.2026–31.03.2026')).toBeInTheDocument();
            expect(boks.getByText('10 000')).toBeInTheDocument();
            expect(boks.getByText('20 000')).toBeInTheDocument();
            expect(boks.getByText('30 000')).toBeInTheDocument();
        }
    );

    test.each([
        { tittel: 'Lagt til', periode: lagNyPeriode() },
        { tittel: 'Fjernet', periode: lagFjernetPeriode() },
    ])('Viser ingen skillelinje for én periode i $tittel', async ({ tittel, periode }) => {
        renderModal(lagEndretKravgrunnlag({ endringer: [periode] }));

        const boks = await finnBoks(tittel);
        expect(boks.queryByRole('separator')).not.toBeInTheDocument();
    });

    test('Viser øvrige perioder samlet under Ingen endringer', async () => {
        const nyPeriode = lagNyPeriode();
        const fjernetPeriode = lagFjernetPeriode();
        const endretPeriode = lagEndretPeriode();
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [nyPeriode, fjernetPeriode, endretPeriode],
            }),
            [
                lagFaktaPeriode(),
                lagFaktaPeriode({
                    id: 'uendret-2',
                    fom: '2025-02-01',
                    tom: '2025-02-28',
                    feilutbetaltBeløp: 6000,
                }),
                lagFaktaPeriode({
                    id: 'ny',
                    fom: nyPeriode.fom,
                    tom: nyPeriode.tom,
                    endringIKravgrunnlag: nyPeriode,
                }),
                lagFaktaPeriode({
                    id: 'fjernet',
                    fom: fjernetPeriode.fom,
                    tom: fjernetPeriode.tom,
                }),
                lagFaktaPeriode({
                    id: 'endret',
                    fom: endretPeriode.fom,
                    tom: endretPeriode.tom,
                    endringIKravgrunnlag: endretPeriode,
                }),
            ]
        );

        const boks = await finnBoks('Ingen endringer');
        expect(
            boks.getByRole('heading', { name: 'Ingen endringer', level: 2 })
        ).toBeInTheDocument();
        expect(boks.getAllByText('Periode')).toHaveLength(1);
        expect(boks.getAllByText('Feilutbetalt')).toHaveLength(1);
        expect(boks.getAllByRole('separator')).toHaveLength(1);
        expect(boks.getByText('01.01.2025–31.01.2025')).toBeInTheDocument();
        expect(boks.getByText('01.02.2025–28.02.2025')).toBeInTheDocument();
        expect(boks.getByText('5 000')).toBeInTheDocument();
        expect(boks.getByText('6 000')).toBeInTheDocument();
        expect(boks.getAllByText('1 måned')).toHaveLength(2);
        expect(boks.queryByText('21.09.2026–27.09.2026')).not.toBeInTheDocument();
        expect(boks.queryByText('01.01.2024–31.12.2024')).not.toBeInTheDocument();
        expect(boks.queryByText('10.08.2026–24.08.2026')).not.toBeInTheDocument();
    });

    test('Viser én uendret periode uten skillelinje', async () => {
        renderModal(lagEndretKravgrunnlag(), [lagFaktaPeriode()]);

        const boks = await finnBoks('Ingen endringer');
        expect(boks.queryByRole('separator')).not.toBeInTheDocument();
    });

    test('Viser ikke Ingen endringer når alle periodene berøres av endringer', () => {
        const endretPeriode = lagEndretPeriode({
            fom: '2025-01-01',
            tom: '2025-01-31',
            gammelPeriode: { fom: '2024-12-01', tom: '2024-12-31' },
        });
        renderModal(lagEndretKravgrunnlag({ endringer: [endretPeriode] }), [
            lagFaktaPeriode(),
            lagFaktaPeriode({
                id: 'gammel',
                fom: '2024-12-01',
                tom: '2024-12-31',
            }),
            lagFaktaPeriode({
                id: 'overlapp',
                fom: '2024-12-15',
                tom: '2025-02-15',
            }),
            lagFaktaPeriode({
                id: 'markert',
                fom: '2025-03-01',
                tom: '2025-03-31',
                endringIKravgrunnlag: lagNyPeriode(),
            }),
            lagFaktaPeriode({
                id: 'delvis-endret',
                fom: '2025-04-01',
                tom: '2025-04-30',
                splittbarePerioder: [
                    {
                        id: 'delperiode',
                        fom: '2025-04-01',
                        tom: '2025-04-15',
                        feilutbetaltBeløp: 2000,
                        rettsligGrunnlag: [],
                        endringIKravgrunnlag: lagNyPeriode({
                            fom: '2025-04-01',
                            tom: '2025-04-15',
                        }),
                    },
                ],
            }),
        ]);

        expect(screen.queryByRole('region', { name: 'Ingen endringer' })).not.toBeInTheDocument();
    });

    test('Lukker ikke modalen når man trykker Escape', async () => {
        renderModal();

        const modal = await screen.findByRole('dialog');
        await user.keyboard('{Escape}');

        expect(modal).toBeInTheDocument();
        expect(hentOverskrift('Endringer i kravgrunnlaget', 1)).toBeInTheDocument();
    });

    describe('Henting av øvrige perioder', () => {
        test('Viser feilmelding fra backend når fakta ikke kan hentes', async () => {
            behandlingFaktaMock.mockRejectedValue(
                lagAxiosFeil({ tittel: 'Fakta utilgjengelig', melding: 'Tjenesten svarer ikke.' })
            );
            renderModal(lagEndretKravgrunnlag(), undefined, { erNyModell: true });

            const varsel = await finnFeilvarsel('Fakta utilgjengelig');
            expect(varsel.getByText('Tjenesten svarer ikke.')).toBeInTheDocument();
            expect(søkEtterOverskrift('Ingen endringer')).not.toBeInTheDocument();
        });

        test('Viser standard feilmelding når fakta feiler uten melding fra backend', async () => {
            behandlingFaktaMock.mockRejectedValue(lagAxiosFeil());
            renderModal(lagEndretKravgrunnlag(), undefined, { erNyModell: true });

            const varsel = await finnFeilvarsel(
                'Kunne ikke hente øvrige perioder i kravgrunnlaget'
            );
            expect(
                varsel.getByText(
                    'Perioder uten endringer kan ikke vises. Du kan fortsatt starte vurderingen.'
                )
            ).toBeInTheDocument();
        });
    });

    describe('Start vurderingen', () => {
        const startVurderingen = async (): Promise<void> =>
            user.click(await screen.findByRole('button', { name: 'Start vurderingen' }));

        test('Lukker modalen når kravgrunnlaget er tatt i bruk og fakta er hentet', async () => {
            const lukkModal = vi.fn();
            benyttNyesteKravgrunnlagMock.mockResolvedValue(lagVellykketSvar(undefined));
            behandlingFaktaMock.mockResolvedValue(lagVellykketSvar(lagFakta([lagFaktaPeriode()])));
            renderModal(lagEndretKravgrunnlag(), [lagFaktaPeriode()], {
                erNyModell: true,
                lukkModal,
            });

            await startVurderingen();

            await vi.waitFor(() => expect(lukkModal).toHaveBeenCalledOnce());
            expect(behandlingFaktaMock).toHaveBeenCalledOnce();
            expect(screen.queryByRole('heading', { name: /^Feil:/ })).not.toBeInTheDocument();
        });

        test('Viser feilmelding fra backend når kravgrunnlaget ikke kan tas i bruk', async () => {
            const lukkModal = vi.fn();
            benyttNyesteKravgrunnlagMock.mockRejectedValue(
                lagAxiosFeil({ tittel: 'Behandlingen er låst', melding: 'Prøv igjen senere.' })
            );
            renderModal(lagEndretKravgrunnlag(), undefined, { lukkModal });

            await startVurderingen();

            const varsel = await finnFeilvarsel('Behandlingen er låst');
            expect(varsel.getByText('Prøv igjen senere.')).toBeInTheDocument();
            expect(lukkModal).not.toHaveBeenCalled();
            expect(behandlingFaktaMock).not.toHaveBeenCalled();
        });

        test('Viser standard feilmelding når kravgrunnlaget feiler uten melding fra backend', async () => {
            benyttNyesteKravgrunnlagMock.mockRejectedValue(lagAxiosFeil());
            renderModal();

            await startVurderingen();

            const varsel = await finnFeilvarsel('Kunne ikke ta i bruk det nye kravgrunnlaget');
            expect(varsel.getByText('Prøv å starte vurderingen på nytt.')).toBeInTheDocument();
        });

        test('Viser feilmelding når fakta ikke kan hentes, og prøver bare fakta på nytt', async () => {
            const lukkModal = vi.fn();
            benyttNyesteKravgrunnlagMock.mockResolvedValue(lagVellykketSvar(undefined));
            behandlingFaktaMock.mockRejectedValueOnce(
                lagAxiosFeil({ tittel: 'Fakta utilgjengelig', melding: 'Tjenesten svarer ikke.' })
            );
            renderModal(lagEndretKravgrunnlag(), [lagFaktaPeriode()], {
                erNyModell: true,
                lukkModal,
            });

            await startVurderingen();

            const varsel = await finnFeilvarsel('Fakta utilgjengelig');
            expect(varsel.getByText('Tjenesten svarer ikke.')).toBeInTheDocument();
            expect(
                screen.getAllByRole('heading', { name: 'Feil: Fakta utilgjengelig' })
            ).toHaveLength(1);
            expect(lukkModal).not.toHaveBeenCalled();

            behandlingFaktaMock.mockResolvedValue(lagVellykketSvar(lagFakta([lagFaktaPeriode()])));
            await startVurderingen();

            await vi.waitFor(() => expect(lukkModal).toHaveBeenCalledOnce());
            expect(benyttNyesteKravgrunnlagMock).toHaveBeenCalledOnce();
            expect(behandlingFaktaMock).toHaveBeenCalledTimes(2);
        });

        test('Viser standard feilmelding når fakta feiler uten melding fra backend', async () => {
            benyttNyesteKravgrunnlagMock.mockResolvedValue(lagVellykketSvar(undefined));
            behandlingFaktaMock.mockRejectedValue(lagAxiosFeil());
            renderModal(lagEndretKravgrunnlag(), [lagFaktaPeriode()], { erNyModell: true });

            await startVurderingen();

            const varsel = await finnFeilvarsel('Kunne ikke hente oppdatert fakta');
            expect(
                varsel.getByText(
                    'Det nye kravgrunnlaget er tatt i bruk, men fakta om feilutbetalingen kunne ikke hentes. Prøv igjen.'
                )
            ).toBeInTheDocument();
        });
    });
});
