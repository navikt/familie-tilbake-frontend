import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { Ressurs } from '../../../typer/ressurs';
import type { VilkårsvurderingResponse } from '../../../typer/tilbakekrevingstyper';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

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

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const setupMock = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVilkårsvurderingKall: (): Promise<Ressurs<VilkårsvurderingResponse>> => {
            const ressurs = mock<Ressurs<VilkårsvurderingResponse>>({
                status: RessursStatus.Suksess,
                data: lagVilkårsvurderingResponse(),
            });
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: (): Promise<Ressurs<string>> => {
            const ressurs = mock<Ressurs<string>>({
                status: RessursStatus.Suksess,
                data: 'suksess',
            });
            return Promise.resolve(ressurs);
        },
    }));

    mockUseBehandling.mockImplementation(() => ({
        erStegBehandlet: (): boolean => false,
        erStegAutoutført: (): boolean => true,
        hentBehandlingMedBehandlingId: jest.fn(),
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 3 av 4'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
    }));
};

describe('VilkårsvurderingContainer', () => {
    test('Vis autoutført', async () => {
        setupMock();

        const fagsakValue = { fagsak: lagFagsak() };
        const { getByText } = render(
            <FagsakContext.Provider value={fagsakValue}>
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
