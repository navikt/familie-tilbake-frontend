import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { HendelseUndertype } from '../../../../kodeverk';
import type { Behandling } from '../../../../typer/behandling';
import type { Fagsak } from '../../../../typer/fagsak';
import type { FaktaPeriodeSkjemaData } from '../typer/fakta';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { Fagsystem, HendelseType } from '../../../../kodeverk';
import { FaktaProvider } from '../FaktaContext';

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const behandling = mock<Behandling>({ eksternBrukId: '1' });
const fagsak = mock<Fagsak>({
    institusjon: undefined,
    fagsystem: Fagsystem.EF,
    eksternFagsakId: '1',
});

const renderComponent = (
    periode: FaktaPeriodeSkjemaData,
    hendelseTyper: HendelseType[] | undefined
): RenderResult => {
    return render(
        <FaktaProvider behandling={behandling} fagsak={fagsak}>
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
    test('skal sette default verdi til HendelseType.Annet når det kun er ett element i hendelseTyper lista', () => {
        renderComponent(mockPeriode, [HendelseType.Annet]);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toBeInTheDocument();
        expect(screen.getByText('Annet')).toBeInTheDocument();
    });

    test('skal sette default verdi i underårsak-select når hendelsestype er valgt og det kun er én undertype', () => {
        const periodeWithValue = {
            ...mockPeriode,
            hendelsestype: HendelseType.Annet,
            hendelsesundertype: 'ANNET_FRITEKST' as HendelseUndertype,
        };
        renderComponent(periodeWithValue, [HendelseType.Annet]);

        const underSelectElement = screen.getByTestId('perioder.0.underårsak');
        expect(underSelectElement).toHaveValue('ANNET_FRITEKST');
    });

    test('skal velge "-" som default når det er flere elementer i hendelseTyper lista', () => {
        const multipleHendelseTyper = [HendelseType.Annet, HendelseType.Dødsfall];
        renderComponent(mockPeriode, multipleHendelseTyper);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toHaveValue('-');
    });
});
