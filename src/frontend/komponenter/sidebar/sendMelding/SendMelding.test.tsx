import type { UserEvent } from '@testing-library/user-event';
import type { DokumentApiHook } from '~/api/dokument';
import type { BehandlingDto, SpråkkodeEnum } from '~/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { FagsakContext } from '~/context/FagsakContext';
import { DokumentMal } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { SendMelding } from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';

const mockUseDokumentApi = vi.fn();
vi.mock('~/api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook => mockUseDokumentApi(),
}));

const renderSendMelding = (
    behandling: BehandlingDto,
    språkkode: SpråkkodeEnum = 'NB',
    behandlingILesemodus: boolean = false
): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak({ språkkode })}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{ behandlingILesemodus }}
                >
                    <SendMeldingProvider>
                        <SendMelding />
                    </SendMeldingProvider>
                </TestBehandlingProvider>
            </FagsakContext>
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

        renderSendMelding(lagBehandling({ varselSendt: false }));

        expect(screen.getByText('Brevmottaker')).toBeInTheDocument();
        expect(screen.getByLabelText('Mal')).toHaveLength(3);
        expect(screen.queryByText('Bokmål')).not.toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis',
            })
        ).not.toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Mal'), DokumentMal.Varsel);

        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(screen.getByText('Bokmål')).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeEnabled();

        expect(
            screen.getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('Fyller ut skjema og sender korrigert varsel', async () => {
        setupMock();

        renderSendMelding(lagBehandling({ varselSendt: true }), 'NN');

        expect(screen.getByText('Brevmottaker')).toBeInTheDocument();
        expect(screen.getByLabelText('Mal')).toHaveLength(3);
        expect(screen.queryByText('Nynorsk')).not.toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(screen.getByLabelText('Mal'), DokumentMal.KorrigertVarsel);

        expect(screen.getByText('Nynorsk')).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            screen.getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('Fyller ut skjema og sender innhent dokumentasjon', async () => {
        setupMock();

        renderSendMelding(lagBehandling({ varselSendt: true }));

        expect(screen.getByText('Brevmottaker')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(screen.getByLabelText('Mal'), DokumentMal.InnhentDokumentasjon);
        await user.type(
            screen.getByRole('textbox', {
                name: 'Liste over dokumenter (skriv ett dokument pr. linje)',
            }),
            'Liste over dokument'
        );

        expect(
            screen.getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('Lesevisning - venter på svar på manuelt brev', async () => {
        setupMock();

        renderSendMelding(lagBehandling({ varselSendt: false }), 'NB', true);

        expect(screen.getByText('Brevmottaker')).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(screen.queryByLabelText('Mal')).not.toBeInTheDocument();
        expect(screen.getByText('Mal')).toBeInTheDocument();
        expect(screen.getByText('Velg brev')).toBeInTheDocument();
    });
});
