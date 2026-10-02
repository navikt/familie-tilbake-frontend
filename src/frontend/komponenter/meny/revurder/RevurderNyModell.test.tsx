import type { AxiosResponse } from 'axios';
import type { BehandlingDto } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosHeaders } from 'axios';
import { MemoryRouter } from 'react-router';

import { FagsakContext } from '@/context/FagsakContext';
import { behandlingOpprettRevurdering } from '@/generated-new';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { RevurderNyModell } from './RevurderNyModell';

const { naviger } = vi.hoisted(() => ({ naviger: vi.fn() }));

vi.mock('react-router', async importOriginal => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => naviger,
}));

vi.mock('@/generated-new/sdk.gen', async importOriginal => ({
    ...(await importOriginal<typeof import('@/generated-new/sdk.gen')>()),
    behandlingOpprettRevurdering: vi.fn(),
}));

const behandlingId = '123e4567-e89b-42d3-a456-426614174000';
const nyBehandlingId = '123e4567-e89b-42d3-a456-426614174001';
const behandlingsUrl = `/fagsystem/BA/fagsak/annen-sak/behandling/${nyBehandlingId}/fakta`;
const vedtaksdato = '2026-09-01';

const renderRevurder = (overrides: Partial<BehandlingDto> = {}): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <MemoryRouter>
                <FagsakContext value={lagFagsak()}>
                    <TestBehandlingProvider
                        behandling={lagBehandling({
                            behandlingId,
                            vedtaksdato,
                            erNyModell: true,
                            kanRevurderingOpprettes: true,
                            ...overrides,
                        })}
                    >
                        <RevurderNyModell />
                    </TestBehandlingProvider>
                </FagsakContext>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

const åpneDialog = async (): Promise<ReturnType<typeof userEvent.setup>> => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Revurder' }));
    return user;
};

describe('RevurderNyModell', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test.each([vedtaksdato, null])(
        'Sender kun valgt årsak og navigerer til ny behandling med vedtaksdato=%s',
        async (opprinneligVedtaksdato: string | null) => {
            vi.mocked(behandlingOpprettRevurdering).mockResolvedValue({
                data: behandlingsUrl,
                status: 200,
                statusText: 'OK',
                headers: new AxiosHeaders(),
                config: { headers: new AxiosHeaders() },
            });
            renderRevurder({ vedtaksdato: opprinneligVedtaksdato });
            const user = await åpneDialog();
            await user.selectOptions(
                screen.getByRole('combobox', { name: 'Årsak til revurderingen' }),
                'REVURDERING_OPPLYSNINGER_OM_VILKÅR'
            );
            await user.click(
                within(screen.getByRole('dialog')).getByRole('button', { name: 'Revurder' })
            );

            expect(behandlingOpprettRevurdering).toHaveBeenCalledExactlyOnceWith({
                path: { behandlingId },
                body: {
                    revurderingsarsak: 'REVURDERING_OPPLYSNINGER_OM_VILKÅR',
                },
                throwOnError: true,
            });
            expect(naviger).toHaveBeenCalledWith(behandlingsUrl);
        }
    );

    test('Krever at saksbehandler velger en årsak', async () => {
        renderRevurder();
        const user = await åpneDialog();
        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Revurder' })
        );

        expect(await screen.findByText('Velg årsak til revurderingen')).toBeInTheDocument();
        expect(behandlingOpprettRevurdering).not.toHaveBeenCalled();
    });

    test('Viser feil uten å navigere når opprettelsen feiler', async () => {
        vi.mocked(behandlingOpprettRevurdering).mockRejectedValue(new Error('Serverfeil'));
        renderRevurder();
        const user = await åpneDialog();
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak til revurderingen' }),
            'REVURDERING_KLAGE_KA'
        );
        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Revurder' })
        );

        expect(
            await screen.findByText('Kunne ikke opprette revurderingen. Prøv igjen.')
        ).toBeInTheDocument();
        expect(naviger).not.toHaveBeenCalled();
    });

    test('Avbryt lukker dialogen uten å opprette revurdering', async () => {
        renderRevurder();
        const user = await åpneDialog();
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(behandlingOpprettRevurdering).not.toHaveBeenCalled();
    });

    test('Nullstiller årsaken når dialogen avbrytes og åpnes på nytt', async () => {
        renderRevurder();
        const user = await åpneDialog();
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak til revurderingen' }),
            'REVURDERING_KLAGE_KA'
        );
        await user.click(screen.getByRole('button', { name: 'Avbryt' }));
        await user.click(screen.getByRole('button', { name: 'Revurder' }));

        expect(screen.getByRole('combobox', { name: 'Årsak til revurderingen' })).toHaveValue('');
    });

    test('Deaktiverer innsending og avbryt mens opprettelsen pågår', async () => {
        vi.mocked(behandlingOpprettRevurdering).mockReturnValue(
            new Promise<AxiosResponse<string>>(vi.fn())
        );
        renderRevurder();
        const user = await åpneDialog();
        const dialog = screen.getByRole('dialog');
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak til revurderingen' }),
            'REVURDERING_KLAGE_KA'
        );
        await user.click(within(dialog).getByRole('button', { name: 'Revurder' }));

        expect(within(dialog).getByRole('button', { name: /Revurder/ })).toBeDisabled();
        expect(within(dialog).getByRole('button', { name: 'Avbryt' })).toBeDisabled();
        await user.click(within(dialog).getByRole('button', { name: /Revurder/ }));
        await user.click(within(dialog).getByRole('button', { name: 'Lukk' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(behandlingOpprettRevurdering).toHaveBeenCalledTimes(1);
    });

    test('Viser feil og hindrer ny innsending hvis responsen mangler URL', async () => {
        vi.mocked(behandlingOpprettRevurdering).mockResolvedValue({
            data: '',
            status: 200,
            statusText: 'OK',
            headers: new AxiosHeaders(),
            config: { headers: new AxiosHeaders() },
            error: undefined,
        });
        renderRevurder();
        const user = await åpneDialog();
        const dialog = screen.getByRole('dialog');
        await user.selectOptions(
            screen.getByRole('combobox', { name: 'Årsak til revurderingen' }),
            'REVURDERING_KLAGE_KA'
        );
        await user.click(within(dialog).getByRole('button', { name: 'Revurder' }));

        expect(
            await screen.findByText(
                'Revurderingen ble opprettet, men svaret mangler URL til behandlingen.'
            )
        ).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Revurder' })).toBeDisabled();
        expect(naviger).not.toHaveBeenCalled();
    });
});
