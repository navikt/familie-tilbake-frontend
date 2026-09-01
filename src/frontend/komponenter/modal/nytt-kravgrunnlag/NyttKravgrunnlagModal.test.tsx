import type { UserEvent } from '@testing-library/user-event';
import type { EndretKravgrunnlag } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { FagsakContext } from '@/context/FagsakContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { NyttKravgrunnlagModal } from './NyttKravgrunnlagModal';

type Endring = EndretKravgrunnlag['endringer'][number];

// Backend bruker diskriminatoren 'ny_periode'/'endret_periode', som avviker fra @/generated-typen.
const lagNyPeriode = (): Endring =>
    ({
        type: 'ny_periode',
        fom: '2026-08-17',
        tom: '2026-08-24',
        beløp: 10000,
    }) as unknown as Endring;

const lagEndretPeriode = (overrides: Record<string, unknown> = {}): Endring =>
    ({
        type: 'endret_periode',
        fom: '2026-08-10',
        tom: '2026-08-24',
        gammelPeriode: { fom: '2026-08-10', tom: '2026-08-10' },
        gammeltBeløp: 5000,
        nyttBeløp: 20000,
        ...overrides,
    }) as unknown as Endring;

const lagEndretKravgrunnlag = (
    overrides: Partial<EndretKravgrunnlag> = {}
): EndretKravgrunnlag => ({
    gammeltBeløp: 10000,
    nyttBeløp: 15000,
    gammelPeriode: {
        fom: '2024-01-01',
        tom: '2024-06-30',
        fomMåned: '2024-01',
        tomMåned: '2024-06',
    },
    nyPeriode: { fom: '2024-01-01', tom: '2024-01-31', fomMåned: '2024-01', tomMåned: '2024-01' },
    endringer: [lagEndretPeriode()],
    ...overrides,
});

const renderModal = (endretKravgrunnlag: EndretKravgrunnlag = lagEndretKravgrunnlag()): void => {
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
        vi.clearAllMocks();
    });

    test('Viser kort for endring i eksisterende periode', async () => {
        renderModal();

        expect(
            await screen.findByRole('heading', {
                name: 'Endringer i eksisterende periode',
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
        expect(screen.getByText('17.08.2026–24.08.2026')).toBeInTheDocument();
        expect(screen.getByText('10 000')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'Detaljer om endringer i den eksisterende perioden',
            })
        ).not.toBeInTheDocument();
    });

    test('Viser begge kortene når det er både ny periode og endring i eksisterende', async () => {
        renderModal(lagEndretKravgrunnlag({ endringer: [lagNyPeriode(), lagEndretPeriode()] }));

        expect(
            await screen.findByRole('heading', { name: 'Endringer i periodene', level: 1 })
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
                name: 'Endringer i eksisterende periode',
                level: 1,
            })
        ).toBeInTheDocument();
    });
});
