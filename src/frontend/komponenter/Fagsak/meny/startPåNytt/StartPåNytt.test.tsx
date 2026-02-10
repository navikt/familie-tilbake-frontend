import type { StartPåNyttHook } from './useStartPåNytt';

import { ActionMenu, Button } from '@navikt/ds-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { StartPåNytt } from './StartPåNytt';
import { FagsakContext } from '../../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';

const mockUseStartPåNytt = vi.fn();
vi.mock('./useStartPåNytt', () => ({
    useStartPåNytt: (): StartPåNyttHook => mockUseStartPåNytt(),
}));

describe('StartPåNytt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Viser feilmodal når behandling tilbake til fakta feiler', async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn();
        const dialogRef = { current: null as HTMLDialogElement | null };

        mockUseStartPåNytt.mockReturnValue({
            mutate: mockMutate,
            isError: true,
            error: {
                message:
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                status: 403,
            },
            reset: vi.fn(),
            dialogRef,
            åpneDialog: () => dialogRef.current?.showModal(),
        });

        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <FagsakContext.Provider value={lagFagsak()}>
                    <TestBehandlingProvider behandling={lagBehandlingDto()}>
                        <ActionMenu open>
                            <ActionMenu.Trigger>
                                <Button>Test kun for å rendre</Button>
                            </ActionMenu.Trigger>
                            <ActionMenu.Content>
                                <StartPåNytt />
                            </ActionMenu.Content>
                        </ActionMenu>
                    </TestBehandlingProvider>
                </FagsakContext.Provider>
            </QueryClientProvider>
        );

        const dialog = document.querySelector('dialog') as HTMLDialogElement;
        dialogRef.current = dialog;
        dialog?.showModal();

        const startKnappModal = screen.getByRole('button', { name: /Start på nytt/i });
        await user.click(startKnappModal);

        expect(mockMutate).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            const errorText = screen.getByText(/403 Forbidden/i);
            expect(errorText).toBeInTheDocument();
        });
    });
});
