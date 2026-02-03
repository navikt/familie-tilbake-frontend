import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';

import OpprettVedtaksbrev from './OpprettVedtaksbrev';
import { FagsakContext } from '../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';

vi.mock('../../../generated-new/@tanstack/react-query.gen', () => ({
    vedtaksbrevLagSvgVedtaksbrevMutation: (): object => ({
        mutationFn: vi.fn().mockResolvedValue(new Blob(['{}'])),
        onMutate: vi.fn(),
    }),
}));

vi.mock('../../../utils/sider', () => ({
    useStegNavigering: (): (() => void) => vi.fn(),
}));

const renderOpprettVedtaksbrev = (): ReturnType<typeof render> => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <TestBehandlingProvider>
                    <OpprettVedtaksbrev />
                </TestBehandlingProvider>
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

describe('OpprettVedtaksbrev', () => {
    describe('Brevets innledning', () => {
        test('viser textarea for brevets innledning', async () => {
            renderOpprettVedtaksbrev();

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', { name: 'Brevets innledning' })
                ).toBeInTheDocument();
            });
        });
    });

    describe('Perioder', () => {
        test('viser ExpansionCard for hver periode med riktig tittel', async () => {
            renderOpprettVedtaksbrev();

            await waitFor(() => {
                expect(screen.getByText('1. februar 2025–28. februar 2025')).toBeInTheDocument();
            });

            expect(screen.getByText('1. mars 2025–31. mars 2025')).toBeInTheDocument();
        });

        test('viser textarea for "Hvordan har vi kommet fram til at du må betale tilbake?"', async () => {
            const user = userEvent.setup();
            renderOpprettVedtaksbrev();

            const periode = await screen.findByRole('region', {
                name: '1. februar 2025–28. februar 2025',
            });

            await user.click(within(periode).getByRole('button', { name: 'Vis mer' }));

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {
                        name: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                    })
                ).toBeInTheDocument();
            });
        });

        test('viser textarea for "Er det særlige grunner til å redusere beløpet?" når særlige grunner er markert', async () => {
            const user = userEvent.setup();
            renderOpprettVedtaksbrev();

            const periode = await screen.findByRole('region', {
                name: '1. februar 2025–28. februar 2025',
            });

            await user.click(within(periode).getByRole('button', { name: 'Vis mer' }));

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {
                        name: 'Er det særlige grunner til å redusere beløpet?',
                    })
                ).toBeInTheDocument();
            });
        });

        test('viser IKKE textarea for særlige grunner når det ikke er markert', async () => {
            const user = userEvent.setup();
            renderOpprettVedtaksbrev();

            const periodeUtenSærligeGrunner = await screen.findByRole('region', {
                name: '1. mars 2025–31. mars 2025',
            });

            await user.click(
                within(periodeUtenSærligeGrunner).getByRole('button', { name: 'Vis mer' })
            );

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {
                        name: 'Perioden fra og med 1. mars 2025 til og med 31. mars 2025',
                    })
                ).toBeInTheDocument();
            });

            expect(
                screen.queryByRole('textbox', {
                    name: 'Er det særlige grunner til å redusere beløpet?',
                })
            ).not.toBeInTheDocument();
        });
    });
});
