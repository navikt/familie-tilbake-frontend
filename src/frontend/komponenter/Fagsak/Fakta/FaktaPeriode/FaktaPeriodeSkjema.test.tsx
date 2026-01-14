import type { BehandlingApiHook } from '../../../../api/behandling';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { Ressurs } from '../../../../typer/ressurs';
import type { FaktaResponse } from '../../../../typer/tilbakekrevingstyper';
import type { FaktaPeriodeSkjemaData } from '../typer/fakta';
import type { RenderResult } from '@testing-library/react';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { FaktaProvider } from '../FaktaContext';
import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { FagsakContext } from '../../../../context/FagsakContext';
import { HendelseUndertype, HendelseType } from '../../../../kodeverk';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { lagFaktaPeriode } from '../../../../testdata/faktaFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../../typer/ressurs';

const mockUseBehandling = vi.fn();
vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

vi.mock('../../../../api/behandling', () => ({
    useBehandlingApi: (): Partial<BehandlingApiHook> => ({
        gjerFaktaKall: vi.fn().mockResolvedValue({
            status: RessursStatus.Suksess,
            data: {
                totalFeilutbetaltPeriode: { fom: '2020-01-01', tom: '2020-12-31' },
                totaltFeilutbetaltBeløp: 1000,
            },
        } as Ressurs<FaktaResponse>),
        sendInnFakta: vi.fn(),
    }),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

const renderComponent = (
    periode: FaktaPeriodeSkjemaData,
    hendelseTyper: HendelseType[] | undefined
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <FaktaProvider behandling={lagBehandling()}>
                    <table>
                        <tbody>
                            <FaktaPeriodeSkjema
                                periode={periode}
                                hendelseTyper={hendelseTyper}
                                index={0}
                                erLesevisning={false}
                            />
                        </tbody>
                    </table>
                </FaktaProvider>
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

const mockPeriode: FaktaPeriodeSkjemaData = {
    index: 0,
    ...lagFaktaPeriode(),
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseBehandling.mockImplementation(() => ({
        behandling: lagBehandling(),
        settIkkePersistertKomponent: vi.fn(),
        nullstillIkkePersisterteKomponenter: vi.fn(),
        ventegrunn: undefined,
        aktivtSteg: undefined,
        behandlingILesemodus: false,
        erStegBehandlet: vi.fn().mockReturnValue(false),
    }));
});

describe('FaktaPeriodeSkjema', () => {
    test('Skal sette default verdi til HendelseType.Annet når det kun er ett element i hendelseTyper lista', () => {
        renderComponent(mockPeriode, [HendelseType.Annet]);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toBeInTheDocument();
        expect(screen.getByText('Annet')).toBeInTheDocument();
    });

    test('Skal sette default verdi i underårsak-select når hendelsestype er valgt og det kun er én undertype', () => {
        const periodeWithValue = {
            ...mockPeriode,
            hendelsestype: HendelseType.Annet,
            hendelsesundertype: HendelseUndertype.AnnetFritekst,
        };
        renderComponent(periodeWithValue, [HendelseType.Annet]);

        const underSelectElement = screen.getByTestId('perioder.0.underårsak');
        expect(underSelectElement).toHaveValue(HendelseUndertype.AnnetFritekst);
    });

    test('Skal velge "-" som default når det er flere elementer i hendelseTyper lista', () => {
        const multipleHendelseTyper = [HendelseType.Annet, HendelseType.Dødsfall];
        renderComponent(mockPeriode, multipleHendelseTyper);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toHaveValue('-');
    });
});
