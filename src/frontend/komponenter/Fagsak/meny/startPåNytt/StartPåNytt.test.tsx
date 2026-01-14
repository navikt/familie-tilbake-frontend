import type { StartPåNyttHook as StartPåNyttHook } from './useStartPåNytt';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { RedirectEtterLagringHook } from '../../../../hooks/useRedirectEtterLagring';
import type { UserEvent } from '@testing-library/user-event';

import { ActionMenu, Button } from '@navikt/ds-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { StartPåNytt } from './StartPåNytt';
import { Feil } from '../../../../api/feil';
import { FagsakContext } from '../../../../context/FagsakContext';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';

const mockUseBehandling = vi.fn();
vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseRedirectEtterLagring = vi.fn();
vi.mock('../../../../hooks/useRedirectEtterLagring', () => ({
    useRedirectEtterLagring: (): RedirectEtterLagringHook => mockUseRedirectEtterLagring(),
}));

const mockUseStartPåNytt = vi.fn();
vi.mock('./useStartPåNytt', () => ({
    useStartPåNytt: (): StartPåNyttHook => mockUseStartPåNytt(),
}));

const mockNullstill = vi.fn();
const setupMocks = (): void => {
    mockUseBehandling.mockReturnValue({
        behandling: lagBehandling(),
        nullstillIkkePersisterteKomponenter: mockNullstill,
        ventegrunn: undefined,
        aktivtSteg: undefined,
        behandlingILesemodus: false,
        erStegBehandlet: vi.fn().mockReturnValue(false),
    });
    mockUseRedirectEtterLagring.mockReturnValue(() => null);
};

describe('StartPåNytt', () => {
    let user: UserEvent;
    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
        setupMocks();
    });

    test('Viser feilmodal når behandling tilbake til fakta feiler', async () => {
        const mockMutate = vi.fn().mockImplementation((_, options) => {
            options.onError(
                new Feil(
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                    403
                )
            );
        });

        mockUseStartPåNytt.mockReturnValue({
            mutate: mockMutate,
            isError: true,
            error: {
                message:
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                status: 403,
            },
        });

        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <FagsakContext.Provider value={lagFagsak({ eksternFagsakId: '123' })}>
                    <ActionMenu open>
                        <ActionMenu.Trigger>
                            <Button>Test kun for å rendre</Button>
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                            <StartPåNytt behandling={lagBehandling()} />
                        </ActionMenu.Content>
                    </ActionMenu>
                </FagsakContext.Provider>
            </QueryClientProvider>
        );

        const dialog = document.querySelector('dialog') as HTMLDialogElement;
        dialog?.showModal();

        expect(mockNullstill).not.toHaveBeenCalled();

        const startKnappModal = screen.getByRole('button', { name: /Start på nytt/i });
        await user.click(startKnappModal);

        expect(mockNullstill).toHaveBeenCalledTimes(1);

        expect(mockMutate).toHaveBeenCalledWith('uuid-1', expect.any(Object));

        await waitFor(() => {
            const errorText = screen.getByText(/403 Forbidden/i);
            expect(errorText).toBeInTheDocument();
        });
    });
});
