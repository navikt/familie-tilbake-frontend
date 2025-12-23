import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { FaktaPeriodeSkjemaData } from '../typer/fakta';
import type { RenderResult } from '@testing-library/react';

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { FaktaProvider } from '../FaktaContext';
import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { HendelseUndertype, HendelseType } from '../../../../kodeverk';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { lagFaktaPeriode } from '../../../../testdata/faktaFactory';

const mockUseBehandling = vi.fn();
vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
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
    return render(
        <FaktaProvider behandling={lagBehandling()} fagsak={lagFagsak()}>
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
    );
};

const mockPeriode: FaktaPeriodeSkjemaData = {
    index: 0,
    ...lagFaktaPeriode(),
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseBehandling.mockImplementation(() => ({
        settIkkePersistertKomponent: vi.fn(),
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
