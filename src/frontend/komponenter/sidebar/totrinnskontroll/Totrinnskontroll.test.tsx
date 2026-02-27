import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';
import type { Totrinnkontroll } from '~/typer/totrinnTyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import {
    TestBehandlingProvider,
    type BehandlingStateContextOverrides,
} from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { lagTotrinnsStegInfo } from '~/testdata/totrinnskontrollFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { Totrinnskontroll } from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';

const standardSteg = [
    lagTotrinnsStegInfo('FAKTA'),
    lagTotrinnsStegInfo('VILKÅRSVURDERING'),
    lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
];

const standardStegMedForeldelse = [
    lagTotrinnsStegInfo('FAKTA'),
    lagTotrinnsStegInfo('FORELDELSE'),
    lagTotrinnsStegInfo('VILKÅRSVURDERING'),
    lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
];

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
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

const setupMocks = (options: {
    totrinnkontroll?: Totrinnkontroll;
    totrinnkontrollFeil?: string;
    angreSendTilBeslutterSuksess?: boolean;
}): void => {
    const { totrinnkontroll, totrinnkontrollFeil, angreSendTilBeslutterSuksess = true } = options;

    mockUseBehandlingApi.mockImplementation(
        (): Partial<BehandlingApiHook> => ({
            gjerTotrinnkontrollKall: (): Promise<Ressurs<Totrinnkontroll>> => {
                if (totrinnkontrollFeil) {
                    const ressurs: Ressurs<Totrinnkontroll> = {
                        status: RessursStatus.Feilet,
                        frontendFeilmelding: totrinnkontrollFeil,
                    };
                    return Promise.resolve(ressurs);
                }
                const ressurs: Ressurs<Totrinnkontroll> = {
                    status: RessursStatus.Suksess,
                    data: totrinnkontroll as Totrinnkontroll,
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
            kallAngreSendTilBeslutter: (): Promise<Ressurs<string>> => {
                if (angreSendTilBeslutterSuksess) {
                    return Promise.resolve({
                        status: RessursStatus.Suksess,
                        data: 'suksess',
                    });
                }
                return Promise.resolve({
                    status: RessursStatus.Feilet,
                    frontendFeilmelding: 'Kunne ikke angre send til beslutter',
                });
            },
        })
    );
};

describe('Totrinnskontroll', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut - godkjenner', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardSteg },
        });

        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(3);

        expect(getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtak',
                })
            ).toBeInTheDocument();
        });

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));

        expect(
            getByRole('button', {
                name: 'Godkjenn vedtak',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Godkjenn vedtak',
            })
        );
    });

    test('Vis og fyll ut - sender tilbake', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardStegMedForeldelse },
        });
        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtak',
                })
            ).toBeInTheDocument();
        });

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_3-false'));

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Returner til saksbehandler',
                })
            ).toBeInTheDocument();
        });

        await user.type(
            getByRole('textbox', {
                name: /Begrunn hvorfor steget må vurderes på nytt/i,
            }),
            'Vurder på nytt!!!!'
        );

        await user.click(
            getByRole('button', {
                name: 'Returner til saksbehandler',
            })
        );
    });

    test('Vis utfylt - sendt tilbake', async () => {
        setupMocks({
            totrinnkontroll: {
                totrinnsstegsinfo: [
                    lagTotrinnsStegInfo('FAKTA', true),
                    lagTotrinnsStegInfo('FORELDELSE', false, 'Foreldelse må vurderes på nytt'),
                    lagTotrinnsStegInfo('VILKÅRSVURDERING', true),
                    lagTotrinnsStegInfo('FORESLÅ_VEDTAK', false, 'Vedtaket må vurderes på nytt'),
                ],
            },
        });

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            lagBehandling(),
            { erBehandlingReturnertFraBeslutter: (): boolean => true }
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            queryByRole('button', {
                name: 'Returner til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
    });

    test('Vis utfylt - foreslått på nytt - lesevisning (rolle saksbehandler)', async () => {
        setupMocks({
            totrinnkontroll: {
                totrinnsstegsinfo: [
                    lagTotrinnsStegInfo('FAKTA', true),
                    lagTotrinnsStegInfo('FORELDELSE', false, 'Foreldelse må vurderes på nytt'),
                    lagTotrinnsStegInfo('VILKÅRSVURDERING', true),
                    lagTotrinnsStegInfo('FORESLÅ_VEDTAK', false, 'Vedtaket må vurderes på nytt'),
                ],
            },
        });

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: false })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeInTheDocument();
        expect(getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(getByText('Vedtak')).toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            queryByRole('button', {
                name: 'Returner til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
    });

    test('Viser bekreftelsesmodal når bruker klikker Godkjenn vedtaket', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardSteg },
        });

        const { getByText, getByRole, getByTestId, queryByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true, erNyModell: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));

        expect(queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Godkjenn vedtak',
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

    test('Lukker bekreftelsesmodal etter vellykket godkjenning', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardSteg },
        });

        const { getByText, getByRole, getByTestId, queryByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        await user.click(getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(getByTestId('stegetGodkjent_idx_steg_2-true'));

        await user.click(
            getByRole('button', {
                name: 'Godkjenn vedtak',
            })
        );

        const modal = await waitFor(() => getByRole('dialog'));

        await user.click(
            within(modal).getByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        );

        await waitFor(() => {
            expect(queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    test('Viser feilmelding når henting av totrinnkontroll feiler', async () => {
        setupMocks({
            totrinnkontrollFeil: 'Kunne ikke hente totrinnkontroll',
        });

        const { getByText } = renderTotrinnskontroll(lagBehandling({ kanEndres: true }));

        await waitFor(() => {
            expect(getByText('Kunne ikke hente totrinnkontroll')).toBeInTheDocument();
        });
    });

    test('Viser skeleton under lasting', async () => {
        let resolvePromise: (value: Ressurs<Totrinnkontroll>) => void = () => {};
        const pendingPromise = new Promise<Ressurs<Totrinnkontroll>>(resolve => {
            resolvePromise = resolve;
        });

        mockUseBehandlingApi.mockImplementation(
            (): Partial<BehandlingApiHook> => ({
                gjerTotrinnkontrollKall: () => pendingPromise,
                sendInnFatteVedtak: vi.fn(),
                kallAngreSendTilBeslutter: vi.fn(),
            })
        );

        const { getByText } = renderTotrinnskontroll(lagBehandling({ kanEndres: true }));

        expect(getByText('Fatter vedtak')).toBeInTheDocument();

        resolvePromise({
            status: RessursStatus.Suksess,
            data: {
                totrinnsstegsinfo: [lagTotrinnsStegInfo('FAKTA')],
            },
        });

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });
    });

    test('Viser valideringsfeil når bruker prøver å sende uten å velge alle steg', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardSteg },
        });

        const { getByText, queryByText, getByRole } = renderTotrinnskontroll(
            lagBehandling({ kanEndres: true })
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        expect(
            queryByText(/Du må velge om stegene skal godkjennes eller vurderes på nytt/i)
        ).not.toBeInTheDocument();

        await user.click(getByRole('button', { name: 'Godkjenn vedtak' }));

        expect(
            getByText(/Du må velge om stegene skal godkjennes eller vurderes på nytt/i)
        ).toBeInTheDocument();
    });

    test('Viser Avbryt-knapp og kaller angreSendTilBeslutter', async () => {
        const kallAngreSendTilBeslutterMock = vi.fn().mockResolvedValue({
            status: RessursStatus.Suksess,
            data: 'suksess',
        });

        mockUseBehandlingApi.mockImplementation(
            (): Partial<BehandlingApiHook> => ({
                gjerTotrinnkontrollKall: (): Promise<Ressurs<Totrinnkontroll>> =>
                    Promise.resolve({
                        status: RessursStatus.Suksess,
                        data: {
                            totrinnsstegsinfo: [
                                lagTotrinnsStegInfo('FAKTA'),
                                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
                            ],
                        },
                    }),
                sendInnFatteVedtak: vi.fn(),
                kallAngreSendTilBeslutter: kallAngreSendTilBeslutterMock,
            })
        );

        const { getByText, getByRole } = renderTotrinnskontroll(
            lagBehandling({
                kanEndres: false,
                behandlingsstegsinfo: [
                    { behandlingssteg: 'FATTE_VEDTAK', behandlingsstegstatus: 'KLAR' },
                ],
            }),
            {
                aktivtSteg: { behandlingssteg: 'FATTE_VEDTAK', behandlingsstegstatus: 'KLAR' },
            }
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        const avbrytKnapp = getByRole('button', { name: 'Avbryt' });
        expect(avbrytKnapp).toBeInTheDocument();

        await user.click(avbrytKnapp);

        expect(kallAngreSendTilBeslutterMock).toHaveBeenCalled();
    });

    test('Viser feilmelding når angreSendTilBeslutter feiler', async () => {
        setupMocks({
            totrinnkontroll: { totrinnsstegsinfo: standardSteg },
            angreSendTilBeslutterSuksess: false,
        });

        const { getByText, getByRole } = renderTotrinnskontroll(
            lagBehandling({
                kanEndres: false,
                behandlingsstegsinfo: [
                    { behandlingssteg: 'FATTE_VEDTAK', behandlingsstegstatus: 'KLAR' },
                ],
            }),
            {
                aktivtSteg: { behandlingssteg: 'FATTE_VEDTAK', behandlingsstegstatus: 'KLAR' },
            }
        );

        await waitFor(() => {
            expect(getByText('Fakta')).toBeInTheDocument();
        });

        await user.click(getByRole('button', { name: 'Avbryt' }));

        await waitFor(() => {
            expect(getByText('Kunne ikke angre send til beslutter')).toBeInTheDocument();
        });
    });
});
