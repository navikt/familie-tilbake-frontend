import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { Ressurs } from '../../../typer/ressurs';
import type { VilkårsvurderingResponse } from '../../../typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { BehandlingContext } from '../../../context/BehandlingContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagBehandlingContext } from '../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { lagVilkårsvurderingResponse } from '../../../testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../typer/ressurs';

const queryClient = createTestQueryClient();

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
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

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
};

describe('VilkårsvurderingContainer', () => {
    test('Vis autoutført', async () => {
        setupMock();
        const behandling = lagBehandling();

        const { getByText } = render(
            <FagsakContext.Provider value={lagFagsak()}>
                <QueryClientProvider client={queryClient}>
                    <BehandlingContext.Provider
                        value={lagBehandlingContext({
                            behandling,
                            erStegAutoutført: (): boolean => true,
                        })}
                    >
                        <VilkårsvurderingProvider>
                            <VilkårsvurderingContainer />
                        </VilkårsvurderingProvider>
                    </BehandlingContext.Provider>
                </QueryClientProvider>
            </FagsakContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeInTheDocument();
        });
    });
});
