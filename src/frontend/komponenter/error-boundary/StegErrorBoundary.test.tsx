import type { FC } from 'react';
import type { DataRouter } from 'react-router';
import type { BehandlingDto, BehandlingsstegsinfoDto } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';

import { BehandlingProvider } from '@/context/BehandlingContext';
import { BehandlingStateProvider } from '@/context/BehandlingStateContext';
import { FagsakContext } from '@/context/FagsakContext';
import { ActionBar } from '@/komponenter/action-bar/ActionBar';
import { useActionBarConfig } from '@/stores/actionBarStore';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient, setBehandlingQueryData } from '@/testutils/queryTestUtils';
import { SYNLIGE_STEG } from '@/utils/sider';

import { StegErrorBoundary } from './StegErrorBoundary';

const BEHANDLING_URL = '/fagsystem/BA/fagsak/123/behandling/456';

const STEGSINFO: BehandlingsstegsinfoDto[] = [
    { behandlingssteg: 'FAKTA', behandlingsstegstatus: 'UTFØRT' },
    { behandlingssteg: 'FORHÅNDSVARSEL', behandlingsstegstatus: 'UTFØRT' },
    { behandlingssteg: 'FORELDELSE', behandlingsstegstatus: 'KLAR' },
    { behandlingssteg: 'VILKÅRSVURDERING', behandlingsstegstatus: 'KLAR' },
];

const lagTestbehandling = (overrides: Partial<BehandlingDto> = {}): BehandlingDto =>
    lagBehandling({
        eksternBrukId: '456',
        behandlingId: '123',
        erNyModell: true,
        støtterManuelleBrevmottakere: true,
        behandlingsstegsinfo: STEGSINFO,
        ...overrides,
    });

const StegSomFeiler: FC = () => {
    throw new Error('Henting av data feilet');
};

const TestActionBar: FC = () => {
    const config = useActionBarConfig();
    return config ? <ActionBar {...config} /> : null;
};

const VILKÅRSVURDERING_INNHOLD = 'Vilkårsvurdering lastet uten feil';

const renderStegMedFeil = (startUrl = `${BEHANDLING_URL}/foreldelse`): DataRouter => {
    const queryClient = createTestQueryClient();
    setBehandlingQueryData(queryClient, '123', lagTestbehandling());

    const router = createMemoryRouter(
        [
            {
                path: `${BEHANDLING_URL}`,
                element: (
                    <QueryClientProvider client={queryClient}>
                        <FagsakContext
                            value={lagFagsak({ eksternFagsakId: '123', fagsystem: 'BA' })}
                        >
                            <Suspense fallback={<div>Laster...</div>}>
                                <BehandlingProvider behandlingId="123">
                                    <BehandlingStateProvider>
                                        <Outlet />
                                        <TestActionBar />
                                    </BehandlingStateProvider>
                                </BehandlingProvider>
                            </Suspense>
                        </FagsakContext>
                    </QueryClientProvider>
                ),
                children: [
                    {
                        path: 'foreldelse',
                        element: (
                            <StegErrorBoundary steg={SYNLIGE_STEG.FORELDELSE}>
                                <StegSomFeiler />
                            </StegErrorBoundary>
                        ),
                    },
                    {
                        path: 'vilkaarsvurdering',
                        element: (
                            <StegErrorBoundary steg={SYNLIGE_STEG.VILKÅRSVURDERING}>
                                <div>{VILKÅRSVURDERING_INNHOLD}</div>
                            </StegErrorBoundary>
                        ),
                    },
                ],
            },
        ],
        { initialEntries: [startUrl] }
    );

    render(<RouterProvider router={router} />);
    return router;
};

describe('StegErrorBoundary', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('burde vise feilmelding når steget feiler', async () => {
        renderStegMedFeil();

        expect(await screen.findByText('Henting av data feilet')).toBeInTheDocument();
    });

    test('burde tilby navigasjon til forrige og neste steg når steget feiler', async () => {
        renderStegMedFeil();

        expect(
            await screen.findByRole('button', { name: 'Gå til forrige steg, Forhåndsvarsel' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Gå til neste steg, Vilkårsvurdering' })
        ).toBeInTheDocument();
    });

    test('burde vise innholdet på neste steg, ikke feilen fra forrige steg', async () => {
        const router = renderStegMedFeil();

        await screen.findByText('Henting av data feilet');

        await act(async () => {
            await router.navigate(`${BEHANDLING_URL}/vilkaarsvurdering`);
        });

        expect(await screen.findByText(VILKÅRSVURDERING_INNHOLD)).toBeInTheDocument();
        expect(screen.queryByText('Henting av data feilet')).not.toBeInTheDocument();
    });
});
