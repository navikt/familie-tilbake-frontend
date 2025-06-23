import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';

import { render, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { FeilutbetalingVilkårsvurderingProvider } from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { HendelseType, Ytelsetype } from '../../../kodeverk';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: () => mockUseBehandling(),
}));

describe('Tester: VilkårsvurderingContainer', () => {
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
    const feilutbetalingVilkårsvurdering: IFeilutbetalingVilkårsvurdering = {
        perioder: perioder,
        rettsgebyr: 1199,
    };
    const setupMock = (
        behandlet: boolean,
        lesevisning: boolean,
        autoutført: boolean,
        vilkårsvurdering?: IFeilutbetalingVilkårsvurdering
    ) => {
        if (vilkårsvurdering) {
            mockUseBehandlingApi.mockImplementation(() => ({
                gjerFeilutbetalingVilkårsvurderingKall: () => {
                    const ressurs = mock<Ressurs<IFeilutbetalingVilkårsvurdering>>({
                        status: RessursStatus.Suksess,
                        data: vilkårsvurdering,
                    });
                    return Promise.resolve(ressurs);
                },
                sendInnFeilutbetalingVilkårsvurdering: () => {
                    const ressurs = mock<Ressurs<string>>({
                        status: RessursStatus.Suksess,
                        data: 'suksess',
                    });
                    return Promise.resolve(ressurs);
                },
            }));
        }
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: () => behandlet,
            erStegAutoutført: () => autoutført,
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
    };

    test('- vis autoutført', async () => {
        setupMock(false, false, true, feilutbetalingVilkårsvurdering);

        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
        });

        expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Gå videre til neste periode',
                })
            ).toBeEnabled();
        });
    });
});
