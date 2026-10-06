import type { UserEvent } from '@testing-library/user-event';
import type { EndretKravgrunnlag } from '@/generated';
import type { KravgrunnlagForskjell } from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { FagsakContext } from '@/context/FagsakContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { NyttKravgrunnlagModal } from './NyttKravgrunnlagModal';

type NyPeriode = Extract<KravgrunnlagForskjell, { type: 'ny_periode' }>;
type EndretPeriode = Extract<KravgrunnlagForskjell, { type: 'endret_periode' }>;
type FjernetPeriode = Extract<KravgrunnlagForskjell, { type: 'fjernet_periode' }>;

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

const renderModal = (
    endretKravgrunnlag: EndretKravgrunnlagModalData = lagEndretKravgrunnlag()
): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={lagBehandling({ behandlingId: 'uuid-1' })}>
                    <NyttKravgrunnlagModal
                        endretKravgrunnlag={endretKravgrunnlag}
                        onFullført={vi.fn()}
                    />
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

describe('NyttKravgrunnlagModal', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
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
        expect(
            screen.getByRole('heading', { name: 'Endringer i kravgrunnlaget', level: 1 })
        ).toBeInTheDocument();
    });

    test('Viser kort for endring i eksisterende periode', async () => {
        renderModal();

        expect(
            await screen.findByRole('heading', {
                name: 'Endringer i kravgrunnlaget',
                level: 1,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
                level: 2,
            })
        ).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–10.08.2026')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–24.08.2026')).toBeInTheDocument();
        expect(screen.getByText('5 000')).toBeInTheDocument();
        expect(screen.getByText('20 000')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Detaljer om den nye perioden' })
        ).not.toBeInTheDocument();
    });

    test('Uendret periode og endret beløp: viser periode uten før/etter, kun beløpsendring', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        fom: '2026-08-10',
                        tom: '2026-08-24',
                        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-24' },
                        gammeltBeløp: 5000,
                        nyttBeløp: 20000,
                    }),
                ],
            })
        );

        expect(
            await screen.findByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
                level: 2,
            })
        ).toBeInTheDocument();
        expect(screen.getAllByText('10.08.2026–24.08.2026')).toHaveLength(1);
        expect(screen.getByText('5 000')).toBeInTheDocument();
        expect(screen.getByText('20 000')).toBeInTheDocument();
    });

    test('Endret periode og uendret beløp: viser beløp uten før/etter, kun periodeendring', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [
                    lagEndretPeriode({
                        fom: '2026-08-10',
                        tom: '2026-08-31',
                        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-24' },
                        gammeltBeløp: 5000,
                        nyttBeløp: 5000,
                    }),
                ],
            })
        );

        expect(
            await screen.findByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
                level: 2,
            })
        ).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–24.08.2026')).toBeInTheDocument();
        expect(screen.getByText('10.08.2026–31.08.2026')).toBeInTheDocument();
        expect(screen.getAllByText('5 000')).toHaveLength(1);
    });

    test('Viser kun kort for ny periode når det bare er en ny periode', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagNyPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'Ny periode må vurderes', level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Detaljer om den nye perioden', level: 2 })
        ).toBeInTheDocument();
        expect(screen.getByText('21.09.2026–27.09.2026')).toBeInTheDocument();
        expect(screen.getByText('10 000')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
            })
        ).not.toBeInTheDocument();
    });

    test('Viser kun kort for fjernet periode når det bare er en fjernet periode', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagFjernetPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'En periode er fjernet', level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Detaljer om perioden som er fjernet',
                level: 2,
            })
        ).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–31.12.2024')).toBeInTheDocument();
        expect(screen.getByText('1 år')).toBeInTheDocument();
        expect(screen.getByText('55 000')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Detaljer om den nye perioden' })
        ).not.toBeInTheDocument();
    });

    test('Viser begge kortene når det er både ny periode og endring i eksisterende', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagNyPeriode(), lagEndretPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'Endringer i kravgrunnlaget', level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Detaljer om den nye perioden', level: 2 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
                level: 2,
            })
        ).toBeInTheDocument();
    });

    test('Viser fjernet, ny og endret periode', async () => {
        renderModal(
            lagEndretKravgrunnlag({
                endringer: [lagFjernetPeriode(), lagNyPeriode(), lagEndretPeriode()],
            })
        );

        expect(
            await screen.findByRole('heading', { name: 'Endringer i kravgrunnlaget', level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er registrert endringer i kravgrunnlaget som må vurderes på nytt.'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Detaljer om perioden som er fjernet',
                level: 2,
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Detaljer om den nye perioden', level: 2 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
                level: 2,
            })
        ).toBeInTheDocument();
    });

    test('Lukker ikke modalen når man trykker Escape', async () => {
        renderModal();

        const modal = await screen.findByRole('dialog');
        await user.keyboard('{Escape}');

        expect(modal).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: 'Endringer i kravgrunnlaget',
                level: 1,
            })
        ).toBeInTheDocument();
    });
});
