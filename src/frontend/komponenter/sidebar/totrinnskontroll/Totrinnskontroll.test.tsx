import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '@/api/behandling';
import type { BehandlingDto } from '@/generated';
import type { Ressurs } from '@/typer/ressurs';
import type { Totrinnkontroll } from '@/typer/totrinnTyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Activity, useState } from 'react';
import { vi } from 'vitest';

import { FagsakContext } from '@/context/FagsakContext';
import {
    type BehandlingStateContextOverrides,
    TestBehandlingProvider,
} from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { lagTotrinnsStegInfo } from '@/testdata/totrinnskontrollFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';
import { RessursStatus } from '@/typer/ressurs';

import { Totrinnskontroll } from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('@/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderTotrinnskontroll = (
    behandling: BehandlingDto,
    stateOverrides: BehandlingStateContextOverrides = {}
): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={behandling} stateOverrides={stateOverrides}>
                    <TotrinnskontrollProvider>
                        <Totrinnskontroll />
                    </TotrinnskontrollProvider>
                </TestBehandlingProvider>
            </FagsakContext>
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

const godkjennTekst = {
    name: 'Godkjenn vedtaket',
};

const godkjennKnapp = (): HTMLElement => screen.getByRole('button', godkjennTekst);

const sendTilSaksbehandlerKnapp = (): HTMLElement =>
    screen.getByRole('button', {
        name: 'Send til saksbehandler',
    });

/**
 * Etterligner sidebaren, som holder panelet montert med <Activity> når det lukkes.
 * Effekter avmonteres når panelet skjules og kjøres på nytt når det vises igjen.
 */
const TotrinnskontrollIPanel = (): React.ReactElement => {
    const [synlig, setSynlig] = useState(true);
    return (
        <>
            <button type="button" onClick={(): void => setSynlig(forrige => !forrige)}>
                Veksle panel
            </button>
            <Activity mode={synlig ? 'visible' : 'hidden'}>
                <TotrinnskontrollProvider>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            </Activity>
        </>
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
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });

        renderTotrinnskontroll(lagBehandling({ kanEndres: true }));

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();

        expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtak')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(3);

        expect(await screen.findByRole('button', godkjennTekst)).toBeDisabled();
        expect(sendTilSaksbehandlerKnapp()).toBeDisabled();

        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_2-true'));

        await user.click(godkjennKnapp());
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
        renderTotrinnskontroll(lagBehandling({ kanEndres: true }));

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();
        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtak')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(4);

        expect(godkjennKnapp()).toBeDisabled();
        expect(sendTilSaksbehandlerKnapp()).toBeDisabled();

        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_2-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_3-false'));

        await user.type(
            screen.getByRole('textbox', {
                name: 'Begrunnelse',
            }),
            'Vurder på nytt!!!!'
        );

        await user.click(sendTilSaksbehandlerKnapp());
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

        renderTotrinnskontroll(lagBehandling(), {
            erBehandlingReturnertFraBeslutter: (): boolean => true,
        });

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();
        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtak')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(4);

        expect(
            screen.queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(screen.getAllByText('Godkjent')).toHaveLength(2);
        expect(screen.getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(screen.getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
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

        renderTotrinnskontroll(lagBehandling({ kanEndres: false }));

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();
        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
        expect(screen.getByText('Vedtak')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(4);

        expect(
            screen.queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).not.toBeInTheDocument();

        expect(screen.getAllByText('Godkjent')).toHaveLength(2);
        expect(screen.getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(screen.getByText('Foreldelse må vurderes på nytt')).toBeInTheDocument();
        expect(screen.getByText('Vedtaket må vurderes på nytt')).toBeInTheDocument();
    });

    test('Viser bekreftelsesmodal når bruker klikker Godkjenn vedtaket', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });

        renderTotrinnskontroll(lagBehandling({ kanEndres: true, erNyModell: true }));

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_2-true'));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(godkjennKnapp());

        expect(screen.getByRole('link', { name: 'Fakta' })).toBeInTheDocument();
        expect(screen.getByText('Denne handlingen kan ikke angres.')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Avbryt',
            })
        ).toBeInTheDocument();
    });

    test('Lukker bekreftelsesmodal etter vellykket godkjenning', async () => {
        setupMocks({
            totrinnsstegsinfo: [
                lagTotrinnsStegInfo('FAKTA'),
                lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
            ],
        });

        renderTotrinnskontroll(lagBehandling({ kanEndres: true }));

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();

        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_1-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_2-true'));

        await user.click(godkjennKnapp());

        const modal = screen.getByRole('dialog');

        await user.click(
            within(modal).getByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('Beholder påbegynt vurdering når panelet lukkes og åpnes igjen', async () => {
        const gjerTotrinnkontrollKall = vi.fn().mockResolvedValue({
            status: RessursStatus.Suksess,
            data: {
                totrinnsstegsinfo: [
                    lagTotrinnsStegInfo('FAKTA'),
                    lagTotrinnsStegInfo('VILKÅRSVURDERING'),
                    lagTotrinnsStegInfo('FORESLÅ_VEDTAK'),
                ],
            },
        });
        mockUseBehandlingApi.mockImplementation(() => ({ gjerTotrinnkontrollKall }));

        const queryClient = createTestQueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <FagsakContext value={lagFagsak()}>
                    <TestBehandlingProvider behandling={lagBehandling({ kanEndres: true })}>
                        <TotrinnskontrollIPanel />
                    </TestBehandlingProvider>
                </FagsakContext>
            </QueryClientProvider>
        );

        expect(await screen.findByRole('link', { name: 'Fakta' })).toBeInTheDocument();

        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_0-true'));
        await user.click(screen.getByTestId('stegetGodkjent_idx_steg_1-false'));
        await user.type(
            screen.getByRole('textbox', { name: 'Begrunnelse' }),
            'Må vurderes på nytt'
        );

        await user.click(screen.getByRole('button', { name: 'Veksle panel' }));
        await user.click(screen.getByRole('button', { name: 'Veksle panel' }));

        expect(gjerTotrinnkontrollKall).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('stegetGodkjent_idx_steg_0-true')).toBeChecked();
        expect(screen.getByTestId('stegetGodkjent_idx_steg_1-false')).toBeChecked();
        expect(screen.getByRole('textbox', { name: 'Begrunnelse' })).toHaveValue(
            'Må vurderes på nytt'
        );
    });
});
