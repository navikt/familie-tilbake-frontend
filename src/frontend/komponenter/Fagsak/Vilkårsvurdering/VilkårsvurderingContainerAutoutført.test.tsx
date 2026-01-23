import type { BehandlingApiHook } from '../../../api/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type { VilkårsvurderingResponse } from '../../../typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
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
                    <TestBehandlingProvider
                        behandling={behandling}
                        stateOverrides={{
                            erStegAutoutført: (): boolean => true,
                        }}
                    >
                        <VilkårsvurderingProvider>
                            <VilkårsvurderingContainer />
                        </VilkårsvurderingProvider>
                    </TestBehandlingProvider>
                </QueryClientProvider>
            </FagsakContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeInTheDocument();
        });
    });
});
