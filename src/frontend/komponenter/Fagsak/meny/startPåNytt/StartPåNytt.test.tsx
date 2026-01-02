import type { StartPåNyttHook as StartPåNyttHook } from './useStartPåNytt';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { RedirectEtterLagringHook } from '../../../../hooks/useRedirectEtterLagring';
import type { UserEvent } from '@testing-library/user-event';

import { ActionMenu, Button } from '@navikt/ds-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { StartPåNytt } from './StartPåNytt';
import { Feil } from '../../../../api/feil';
import { lagBehandling } from '../../../../testdata/behandlingFactory';

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseFagsakStore = jest.fn();
jest.mock('../../../../stores/fagsakStore', () => ({
    useFagsakStore: (): { eksternFagsakId: string } => mockUseFagsakStore(),
}));

const mockUseRedirectEtterLagring = jest.fn();
jest.mock('../../../../hooks/useRedirectEtterLagring', () => ({
    useRedirectEtterLagring: (): RedirectEtterLagringHook => mockUseRedirectEtterLagring(),
}));

const mockUseStartPåNytt = jest.fn();
jest.mock('./useStartPåNytt', () => ({
    useStartPåNytt: (): StartPåNyttHook => mockUseStartPåNytt(),
}));

const mockNullstill = jest.fn();
const setupMocks = (): void => {
    mockUseBehandling.mockReturnValue({
        nullstillIkkePersisterteKomponenter: mockNullstill,
    });
    mockUseFagsakStore.mockReturnValue({
        eksternFagsakId: '123',
    });
    mockUseRedirectEtterLagring.mockReturnValue(() => null);
};

describe('StartPåNytt', () => {
    let user: UserEvent;
    beforeEach(() => {
        jest.clearAllMocks();
        user = userEvent.setup();
        setupMocks();
    });

    test('Viser feilmodal når behandling tilbake til fakta feiler', async () => {
        const mockMutate = jest.fn().mockImplementation((_, options) => {
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

        render(
            <ActionMenu open>
                <ActionMenu.Trigger>
                    <Button>Test kun for å rendre</Button>
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <StartPåNytt behandling={lagBehandling()} />
                </ActionMenu.Content>
            </ActionMenu>
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
