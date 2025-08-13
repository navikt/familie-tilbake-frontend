import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import FeilutbetalingFaktaPeriode from './FeilutbetalingFaktaPeriodeSkjema';
import { Fagsystem, HendelseType } from '../../../../kodeverk';
import { FeilutbetalingFaktaProvider } from '../FeilutbetalingFaktaContext';

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: () => mockUseBehandling(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

const renderFeilutbetalingFaktaPeriode = (
    periode: FaktaPeriodeSkjemaData,
    hendelseTyper: HendelseType[] | undefined,
    erLesevisning = false
) => {
    const behandling = mock<IBehandling>({ eksternBrukId: '1' });
    const fagsak = mock<IFagsak>({
        institusjon: undefined,
        fagsystem: Fagsystem.EF,
        eksternFagsakId: '1',
    });

    mockUseBehandling.mockImplementation(() => ({
        settIkkePersistertKomponent: jest.fn(),
    }));

    mockUseBehandlingApi.mockImplementation(() => ({
        gjerFeilutbetalingFaktaKall: () => Promise.resolve(),
        sendInnFeilutbetalingFakta: () => Promise.resolve(),
    }));

    return render(
        <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
            <table>
                <tbody>
                    <FeilutbetalingFaktaPeriode
                        periode={periode}
                        hendelseTyper={hendelseTyper}
                        index={0}
                        erLesevisning={erLesevisning}
                    />
                </tbody>
            </table>
        </FeilutbetalingFaktaProvider>
    );
};

describe('FeilutbetalingFaktaPeriodeSkjema', () => {
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
    });

    test('skal sette default verdi til HendelseType.Annet når det kun er ett element i hendelseTyper lista', () => {
        const hendelseTyper = [HendelseType.Annet];

        renderFeilutbetalingFaktaPeriode(mockPeriode, hendelseTyper);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toHaveValue(HendelseType.Annet);
    });

    test('skal sette default verdi når det kun er ett element i hendelseTyper lista', () => {
        const hendelseTyper = [HendelseType.Annet];

        renderFeilutbetalingFaktaPeriode(mockPeriode, hendelseTyper);

        const selectElement = screen.getByTestId('perioder.0.årsak');
        expect(selectElement).toHaveValue(HendelseType.Annet);
    });
});
