import type { DokumentApiHook } from '../../../../api/dokument';
import type { Http } from '../../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { SpråkkodeEnum } from '../../../../generated';
import type { Behandling } from '../../../../typer/behandling';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import SendMelding from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';
import { FagsakContext } from '../../../../context/FagsakContext';
import { DokumentMal } from '../../../../kodeverk';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { RessursStatus } from '../../../../typer/ressurs';

jest.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});
const mockUseDokumentApi = jest.fn();
jest.mock('../../../../api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook => mockUseDokumentApi(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const renderSendMelding = (
    behandling: Behandling,
    språkkode: SpråkkodeEnum = 'NB'
): RenderResult => {
    const fagsakValue = {
        fagsak: lagFagsak({ språkkode }),
        isLoading: false,
        error: undefined,
    };

    return render(
        <FagsakContext.Provider value={fagsakValue}>
            <SendMeldingProvider behandling={behandling}>
                <SendMelding behandling={behandling} />
            </SendMeldingProvider>
        </FagsakContext.Provider>
    );
};

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
    }));
};

describe('SendMelding', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    test('Fyller ut skjema og sender varsel', async () => {
        setupMock(false);

        const { getByText, getByLabelText, getByRole, queryByRole, queryByText } =
            renderSendMelding(lagBehandling({ varselSendt: false }));

        await waitFor(() => {
            expect(getByText('Brevmottaker')).toBeInTheDocument();
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

    test('Fyller ut skjema og sender korrigert varsel', async () => {
        setupMock(false);

        const { getByText, getByLabelText, getByRole, queryByText } = renderSendMelding(
            lagBehandling({ varselSendt: true }),
            'NN'
        );

        await waitFor(() => {
            expect(getByText('Brevmottaker')).toBeInTheDocument();
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

    test('Fyller ut skjema og sender innhent dokumentasjon', async () => {
        setupMock(false);

        const { getByText, getByLabelText, getByRole } = renderSendMelding(
            lagBehandling({ varselSendt: true })
        );

        await waitFor(() => {
            expect(getByText('Brevmottaker')).toBeInTheDocument();
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

    test('Lesevisning - venter på svar på manuelt brev', async () => {
        setupMock(true);

        const { getByText, getByRole, queryByLabelText } = renderSendMelding(
            lagBehandling({ varselSendt: false })
        );

        expect(getByText('Brevmottaker')).toBeInTheDocument();

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
