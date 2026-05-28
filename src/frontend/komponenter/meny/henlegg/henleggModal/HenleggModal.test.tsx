import type { UserEvent } from '@testing-library/user-event';
import type { RefObject } from 'react';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto, BehandlingsresultatstypeEnum } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { HenleggModal } from './HenleggModal';

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderHenleggModal = (
    behandling: BehandlingDto,
    årsaker: BehandlingsresultatstypeEnum[]
): void => {
    const queryClient = createTestQueryClient();
    const mockDialogRef: RefObject<HTMLDialogElement | null> = { current: null };
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={behandling}>
                    <HenleggModal dialogRef={mockDialogRef} årsaker={årsaker} />
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
    mockDialogRef.current?.showModal();
};

const setupMocks = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        henleggBehandling: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

const henleggKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Henlegg' });
const henleggTittel = (): HTMLElement =>
    screen.getByRole('heading', { name: 'Henlegg tilbakekrevingen', level: 1 });

describe('HenleggModal', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        setupMocks();
    });

    test('Henlegger behandling med varsel sendt', async () => {
        renderHenleggModal(lagBehandling({ varselSendt: true }), ['HENLAGT_FEILOPPRETTET']);

        expect(henleggTittel()).toBeInTheDocument();

        expect(screen.getByText('Informer søker:')).toBeInTheDocument();
        expect(screen.getByText('Forhåndsvis brev')).toBeInTheDocument();

        await user.click(henleggKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');
        await user.click(henleggKnapp());
    });

    test('Henlegger behandling med varsel ikke sendt', async () => {
        renderHenleggModal(lagBehandling(), ['HENLAGT_FEILOPPRETTET']);

        expect(henleggTittel()).toBeInTheDocument();

        expect(screen.queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(screen.queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(henleggKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(screen.getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');
        await user.click(henleggKnapp());
    });

    test('Henlegger revurdering, med brev', async () => {
        renderHenleggModal(lagBehandling({ type: 'REVURDERING_TILBAKEKREVING' }), [
            'HENLAGT_FEILOPPRETTET_MED_BREV',
            'HENLAGT_FEILOPPRETTET_UTEN_BREV',
        ]);

        expect(screen.queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Forhåndsvis brev' })).not.toBeInTheDocument();

        await user.click(henleggKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            screen.getByLabelText('Årsak til henleggelse'),
            'HENLAGT_FEILOPPRETTET_MED_BREV'
        );
        await user.type(screen.getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        await user.click(henleggKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(
            screen.getByRole('textbox', { name: 'Fritekst til brev' }),
            'Revurdering er feilopprettet'
        );

        expect(screen.getByText('Informer søker:')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Forhåndsvis brev' })).toBeInTheDocument();

        await user.click(henleggKnapp());
    });

    test('Henlegger revurdering, uten brev', async () => {
        renderHenleggModal(lagBehandling({ type: 'REVURDERING_TILBAKEKREVING' }), [
            'HENLAGT_FEILOPPRETTET_MED_BREV',
            'HENLAGT_FEILOPPRETTET_UTEN_BREV',
        ]);

        expect(henleggTittel()).toBeInTheDocument();

        expect(screen.queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(screen.queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(henleggKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            screen.getByLabelText('Årsak til henleggelse'),
            'HENLAGT_FEILOPPRETTET_UTEN_BREV'
        );
        await user.type(screen.getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        expect(screen.queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(screen.queryByText('Forhåndsvis brev')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('textbox', { name: 'Fritekst til brev' })
        ).not.toBeInTheDocument();

        await user.click(henleggKnapp());
    });
});
