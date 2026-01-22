import type { DokumentApiHook } from '../../../../api/dokument';
import type { Http } from '../../../../api/http/HttpProvider';
import type { BehandlingDto, SpråkkodeEnum } from '../../../../generated';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import SendMelding from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';
import { FagsakContext } from '../../../../context/FagsakContext';
import { DokumentMal } from '../../../../kodeverk';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../../typer/ressurs';

vi.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});

const mockUseDokumentApi = vi.fn();
vi.mock('../../../../api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook => mockUseDokumentApi(),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

const renderSendMelding = (
    behandling: BehandlingDto,
    språkkode: SpråkkodeEnum = 'NB',
    behandlingILesemodus: boolean = false
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak({ språkkode })}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{ behandlingILesemodus }}
                >
                    <SendMeldingProvider>
                        <SendMelding />
                    </SendMeldingProvider>
                </TestBehandlingProvider>
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

const setupMock = (): void => {
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
};

describe('SendMelding', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Fyller ut skjema og sender varsel', async () => {
        setupMock();

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
        setupMock();

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
        setupMock();

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
        setupMock();

        const { getByText, getByRole, queryByLabelText } = renderSendMelding(
            lagBehandling({ varselSendt: false }),
            'NB',
            true
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
