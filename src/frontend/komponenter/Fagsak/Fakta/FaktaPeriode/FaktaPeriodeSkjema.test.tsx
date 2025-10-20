import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { HendelseUndertype } from '../../../../kodeverk';
import type { FaktaPeriodeSkjemaData } from '../typer/fakta';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { FaktaProvider } from '../FaktaContext';
import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { HendelseType } from '../../../../kodeverk';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

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
    feilutbetaltBeløp: 1000,
    periode: {
        fom: '2023-01-01',
        tom: '2023-01-31',
    },
    hendelsestype: undefined,
    hendelsesundertype: undefined,
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseBehandling.mockImplementation(() => ({
        settIkkePersistertKomponent: jest.fn(),
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
            hendelsesundertype: 'ANNET_FRITEKST' as HendelseUndertype,
        };
        renderComponent(periodeWithValue, [HendelseType.Annet]);

        const underSelectElement = screen.getByTestId('perioder.0.underårsak');
        expect(underSelectElement).toHaveValue('ANNET_FRITEKST');
    });

    test('Skal velge "-" som default når det er flere elementer i hendelseTyper lista', () => {
        const multipleHendelseTyper = [HendelseType.Annet, HendelseType.Dødsfall];
        renderComponent(mockPeriode, multipleHendelseTyper);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toHaveValue('-');
    });
});
