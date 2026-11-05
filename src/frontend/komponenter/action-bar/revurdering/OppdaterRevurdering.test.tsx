import type { TilbakekrevingRevurderingsarsak } from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { OppdaterRevurdering } from './OppdaterRevurdering';

const revurderingsarsak: TilbakekrevingRevurderingsarsak = {
    revurderingsarsak: 'foreldelse',
    begrunnelse: 'Kravet er foreldet',
};

describe('OppdaterRevurdering', () => {
    test('Lagre uten endring viser beskjed i stedet for å sende kall', async () => {
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={createTestQueryClient()}>
                <TestBehandlingProvider behandling={lagBehandling({ erNyModell: true })}>
                    <OppdaterRevurdering revurderingsarsak={revurderingsarsak} />
                </TestBehandlingProvider>
            </QueryClientProvider>
        );

        await user.click(screen.getByRole('button', { name: 'Rediger revurdering' }));
        const dialog = screen.getByRole('dialog', { name: 'Rediger revurdering' });
        const lagre = within(dialog).getByRole('button', { name: 'Lagre' });
        expect(lagre).toBeEnabled();

        await user.click(lagre);
        expect(within(dialog).getByText('Ingen endringer å lagre')).toBeInTheDocument();

        await user.type(within(dialog).getByRole('textbox'), ' x');
        expect(within(dialog).queryByText('Ingen endringer å lagre')).not.toBeInTheDocument();
    });
});
