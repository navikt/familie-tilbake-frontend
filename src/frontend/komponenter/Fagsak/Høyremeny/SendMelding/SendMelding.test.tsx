import type { DokumentApiHook } from '../../../../api/dokument';
import type { Http } from '../../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import SendMelding from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';
import { DokumentMal, Fagsystem } from '../../../../kodeverk';
import { Målform } from '../../../../typer/fagsak';
import { RessursStatus } from '../../../../typer/ressurs';

jest.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseDokumentApi = jest.fn();
jest.mock('../../../../api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook => mockUseDokumentApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const renderSendMelding = (fagsak: IFagsak, behandling: IBehandling): RenderResult =>
    render(
        <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
            <SendMelding fagsak={fagsak} behandling={behandling} />
        </SendMeldingProvider>
    );

const setupMock = (behandlingILesemodus: boolean): void => {
    mockUseDokumentApi.mockImplementation(() => ({
        bestillBrev: (): Promise<{
            status: RessursStatus;
            data: string;
        }> =>
            Promise.resolve({
                status: RessursStatus.Suksess,
                data: 'suksess',
            }),
    }));
    mockUseBehandling.mockImplementation(() => ({
        behandlingILesemodus: behandlingILesemodus,
        hentBehandlingMedBehandlingId: (): Promise<void> => Promise.resolve(),
        settIkkePersistertKomponent: jest.fn(),
        nullstillIkkePersisterteKomponenter: jest.fn(),
    }));
};

describe('Tester: SendMelding', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    test('- fyller ut skjema og sender varsel', async () => {
        setupMock(false);
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole, queryByRole, queryByText } =
            renderSendMelding(fagsak, behandling);

        await waitFor(() => {
            expect(getByText('Mottaker')).toBeInTheDocument();
        });

        expect(getByLabelText('Mal')).toHaveLength(3);
        expect(queryByText('Bokmål')).not.toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis',
            })
        ).not.toBeInTheDocument();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.Varsel);

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(getByText('Bokmål')).toBeInTheDocument();
        await user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- fyller ut skjema og sender korrigert varsel', async () => {
        setupMock(false);
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nn,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole, queryByText } = renderSendMelding(
            fagsak,
            behandling
        );

        await waitFor(() => {
            expect(getByText('Mottaker')).toBeInTheDocument();
        });

        expect(getByLabelText('Mal')).toHaveLength(3);
        expect(queryByText('Nynorsk')).not.toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.KorrigertVarsel);

        expect(getByText('Nynorsk')).toBeInTheDocument();
        await user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- fyller ut skjema og sender innhent dokumentasjon', async () => {
        setupMock(false);
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole } = renderSendMelding(fagsak, behandling);

        await waitFor(() => {
            expect(getByText('Mottaker')).toBeInTheDocument();
        });
        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.InnhentDokumentasjon);
        await user.type(
            getByRole('textbox', {
                name: 'Liste over dokumenter (skriv ett dokument pr. linje)',
            }),
            'Liste over dokument'
        );

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- lesevisning - venter på svar på manuelt brev', async () => {
        setupMock(true);
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByRole, queryByLabelText } = renderSendMelding(fagsak, behandling);

        expect(getByText('Mottaker')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(queryByLabelText('Mal')).not.toBeInTheDocument();
        expect(getByText('Mal')).toBeInTheDocument();
        expect(getByText('Velg brev')).toBeInTheDocument();
    });
});
