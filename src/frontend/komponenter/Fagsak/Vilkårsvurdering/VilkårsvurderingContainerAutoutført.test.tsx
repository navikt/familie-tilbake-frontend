import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { Ressurs } from '../../../typer/ressurs';
import type { VilkårsvurderingResponse } from '../../../typer/tilbakekrevingstyper';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { lagVilkårsvurderingResponse } from '../../../testdata/vilkårsvurderingFactory';
import { RessursStatus } from '../../../typer/ressurs';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

vi.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): NavigateFunction => vi.fn(),
    };
});

const mockUseBehandling = vi.fn();
vi.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const setupMock = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVilkårsvurderingKall: (): Promise<Ressurs<VilkårsvurderingResponse>> => {
            const ressurs: Ressurs<VilkårsvurderingResponse> = {
                status: RessursStatus.Suksess,
                data: lagVilkårsvurderingResponse(),
            };
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));

    mockUseBehandling.mockImplementation(() => ({
        erStegBehandlet: (): boolean => false,
        erStegAutoutført: (): boolean => true,
        hentBehandlingMedBehandlingId: vi.fn(),
        actionBarStegtekst: vi.fn().mockReturnValue('Steg 3 av 4'),
        harVærtPåFatteVedtakSteget: vi.fn().mockReturnValue(false),
    }));
};

describe('VilkårsvurderingContainer', () => {
    test('Vis autoutført', async () => {
        setupMock();

        const { getByText } = render(
            <FagsakContext.Provider value={lagFagsak()}>
                <QueryClientProvider client={queryClient}>
                    <VilkårsvurderingProvider behandling={lagBehandling()}>
                        <VilkårsvurderingContainer behandling={lagBehandling()} />
                    </VilkårsvurderingProvider>
                </QueryClientProvider>
            </FagsakContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeInTheDocument();
        });
    });
});
