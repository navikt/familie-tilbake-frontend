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

const lagEndretKravgrunnlag = (
    overrides: Partial<EndretKravgrunnlag> = {}
): EndretKravgrunnlag => ({
    gammeltBeløp: 10000,
    nyttBeløp: 15000,
    gammelPeriode: {
        fom: '2024-01-01',
        tom: '2024-01-31',
        fomMåned: '2024-01',
        tomMåned: '2024-01',
    },
    nyPeriode: { fom: '2024-01-01', tom: '2024-01-31', fomMåned: '2024-01', tomMåned: '2024-01' },
    endringer: [],
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

    test('Viser periode og feilutbetalt beløp', async () => {
        renderModal();

        expect(
            await screen.findByRole('heading', { name: 'Ny periode må vurderes', level: 1 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Detaljer om perioden', level: 2 })
        ).toBeInTheDocument();
        expect(screen.getByText('01.01.2024–31.01.2024')).toBeInTheDocument();
        expect(screen.getByText('15 000')).toBeInTheDocument();
    });

    test('Lukker ikke modalen når man trykker Escape', async () => {
        renderModal();

        const modal = await screen.findByRole('dialog');
        await user.keyboard('{Escape}');

        expect(modal).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Ny periode må vurderes', level: 1 })
        ).toBeInTheDocument();
    });
});
