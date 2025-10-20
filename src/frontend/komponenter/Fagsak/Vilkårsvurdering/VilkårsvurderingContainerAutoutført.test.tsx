import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { Ressurs } from '../../../typer/ressurs';
import type {
    VilkårsvurderingResponse,
    VilkårsvurderingPeriode,
} from '../../../typer/tilbakekrevingstyper';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { HendelseType } from '../../../kodeverk';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
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

const perioder: VilkårsvurderingPeriode[] = [
    {
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        hendelsestype: HendelseType.BosattIRiket,
        foreldet: false,
        begrunnelse: undefined,
    },
    {
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
        hendelsestype: HendelseType.BorMedSøker,
        foreldet: false,
        begrunnelse: undefined,
    },
];

const vilkårsvurdering: VilkårsvurderingResponse = {
    perioder: perioder,
    rettsgebyr: 1199,
};

const setupMock = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVilkårsvurderingKall: (): Promise<Ressurs<VilkårsvurderingResponse>> => {
            const ressurs = mock<Ressurs<VilkårsvurderingResponse>>({
                status: RessursStatus.Suksess,
                data: vilkårsvurdering,
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

        const { getByText, getByRole } = render(
            <QueryClientProvider client={queryClient}>
                <VilkårsvurderingProvider behandling={lagBehandling()} fagsak={lagFagsak()}>
                    <VilkårsvurderingContainer behandling={lagBehandling()} fagsak={lagFagsak()} />
                </VilkårsvurderingProvider>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(getByText('Tilbakekreving')).toBeInTheDocument();
        });

        expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Neste periode',
                })
            ).toBeEnabled();
        });
    });
});
