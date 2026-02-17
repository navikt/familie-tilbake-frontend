import type { BehandlingApiHook } from '../../../api/behandling';
import type { BehandlingDto } from '../../../generated';
import type { Ressurs } from '../../../typer/ressurs';
import type { Totrinnkontroll } from '../../../typer/totrinnTyper';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { Totrinnskontroll } from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';
import { FagsakContext } from '../../../context/FagsakContext';
import {
    TestBehandlingProvider,
    type BehandlingStateContextOverrides,
} from '../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { lagTotrinnsStegInfo } from '../../../testdata/totrinnskontrollFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderTotrinnskontroll = (
    behandling: BehandlingDto,
    stateOverrides: BehandlingStateContextOverrides = {}
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <TestBehandlingProvider behandling={behandling} stateOverrides={stateOverrides}>
                    <TotrinnskontrollProvider>
                        <Totrinnskontroll />
                    </TotrinnskontrollProvider>
                </TestBehandlingProvider>
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

const setupMocks = (totrinnkontroll: Totrinnkontroll): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerTotrinnkontrollKall: (): Promise<Ressurs<Totrinnkontroll>> => {
            const ressurs: Ressurs<Totrinnkontroll> = {
                status: RessursStatus.Suksess,
                data: totrinnkontroll,
            };
            return Promise.resolve(ressurs);
        },
        sendInnFatteVedtak: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

describe('Totrinnskontroll', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut - godkjenner', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });

        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(3);

        expect(getByText('Tilbakekreving')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            ).toBeDisabled();
        });
        expect(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeDisabled();

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));

        expect(
            getByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        );
    });

    test('Vis og fyll ut - sender tilbake', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('FORELDELSE'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });
        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Tilbakekreving')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            ).toBeDisabled();
        });
        expect(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeDisabled();

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_3-false'));

        expect(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeDisabled();

        await user.type(
            getByRole('textbox', {
                name: 'Begrunnelse',
            }),
            'Vurder på nytt!!!!'
        );

        expect(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        );
    });

    test('Vis utfylt - sendt tilbake', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA', true),
                lagTotrinnsStegInfo('FORELDELSE', false, 'Foreldelse må vurderes på nytt'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING', true),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK', false, 'Vedtaket må vurderes på nytt'),
            ],
        });

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            lagBehandling(),
            { erBehandlingReturnertFraBeslutter: (): boolean => true }
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Tilbakekreving')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
    });

    test('Vis utfylt - foreslått på nytt - lesevisning (rolle saksbehandler)', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA', true),
                lagTotrinnsStegInfo('FORELDELSE', false, 'Foreldelse må vurderes på nytt'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING', true),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK', false, 'Vedtaket må vurderes på nytt'),
            ],
        });

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: false })
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Tilbakekreving')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
    });

    test('Viser bekreftelsesmodal når bruker klikker Godkjenn vedtaket', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });

        const { getByText, getByRole, getByTestId, queryByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));

        expect(queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        );

        await waitFor(() => {
            expect(getByRole('dialog')).toBeInTheDocument();
        });

        expect(getByText('Denne handlingen kan ikke angres.')).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Avbryt',
            })
        ).toBeInTheDocument();
    });
});
