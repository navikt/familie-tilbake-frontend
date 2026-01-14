import type { BehandlingApiHook } from '../../../../api/behandling';
import type { BehandlingHook } from '../../../../context/BehandlingContext';
import type { BehandlingDto } from '../../../../generated';
import type { Ressurs } from '../../../../typer/ressurs';
import type { Totrinnkontroll } from '../../../../typer/totrinnTyper';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import Totrinnskontroll from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';
import { FagsakContext } from '../../../../context/FagsakContext';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { lagTotrinnsStegInfo } from '../../../../testdata/totrinnskontrollFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { Behandlingssteg } from '../../../../typer/behandling';
import { RessursStatus } from '../../../../typer/ressurs';

const mockUseBehandling = vi.fn();
vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

const renderTotrinnskontroll = (behandling: BehandlingDto): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <TotrinnskontrollProvider behandling={behandling}>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

const setupMocks = (returnertFraBeslutter: boolean, totrinnkontroll: Totrinnkontroll): void => {
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
    mockUseBehandling.mockImplementation(() => ({
        behandling: lagBehandling(),
        erStegBehandlet: (): boolean => false,
        visVenteModal: false,
        erBehandlingReturnertFraBeslutter: (): boolean => returnertFraBeslutter,
        ventegrunn: undefined,
        aktivtSteg: undefined,
        behandlingILesemodus: false,
    }));
};

describe('Totrinnskontroll', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut - godkjenner', async () => {
        setupMocks(false, {
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo(Behandlingssteg.Fakta),
                lagTotrinnsStegInfo(Behandlingssteg.Vilkårsvurdering),
                lagTotrinnsStegInfo(Behandlingssteg.ForeslåVedtak),
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
        setupMocks(false, {
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo(Behandlingssteg.Fakta),
                lagTotrinnsStegInfo(Behandlingssteg.Foreldelse),
                lagTotrinnsStegInfo(Behandlingssteg.Vilkårsvurdering),
                lagTotrinnsStegInfo(Behandlingssteg.ForeslåVedtak),
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
        setupMocks(true, {
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo(Behandlingssteg.Fakta, true),
                lagTotrinnsStegInfo(
                    Behandlingssteg.Foreldelse,
                    false,
                    'Foreldelse må vurderes på nytt'
                ),
                lagTotrinnsStegInfo(Behandlingssteg.Vilkårsvurdering, true),
                lagTotrinnsStegInfo(
                    Behandlingssteg.ForeslåVedtak,
                    false,
                    'Vedtaket må vurderes på nytt'
                ),
            ],
        });

        const { getByText, getAllByText, getAllByRole, queryByRole } =
            renderTotrinnskontroll(lagBehandling());

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
        setupMocks(false, {
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo(Behandlingssteg.Fakta, true),
                lagTotrinnsStegInfo(
                    Behandlingssteg.Foreldelse,
                    false,
                    'Foreldelse må vurderes på nytt'
                ),
                lagTotrinnsStegInfo(Behandlingssteg.Vilkårsvurdering, true),
                lagTotrinnsStegInfo(
                    Behandlingssteg.ForeslåVedtak,
                    false,
                    'Vedtaket må vurderes på nytt'
                ),
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
});
