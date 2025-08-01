import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { ITotrinnkontroll } from '../../../../typer/totrinnTyper';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import Totrinnskontroll from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';
import { Behandlingssteg } from '../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

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

const renderTotrinnskontroll = (behandling: IBehandling, fagsak: IFagsak) =>
    render(
        <TotrinnskontrollProvider behandling={behandling} fagsak={fagsak}>
            <Totrinnskontroll />
        </TotrinnskontrollProvider>
    );

const setupMock = (returnertFraBeslutter: boolean, totrinnkontroll: ITotrinnkontroll) => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerTotrinnkontrollKall: () => {
            const ressurs = mock<Ressurs<ITotrinnkontroll>>({
                status: RessursStatus.Suksess,
                data: totrinnkontroll,
            });
            return Promise.resolve(ressurs);
        },
        sendInnFatteVedtak: () => {
            const ressurs = mock<Ressurs<string>>({
                status: RessursStatus.Suksess,
                data: 'suksess',
            });
            return Promise.resolve(ressurs);
        },
    }));
    mockUseBehandling.mockImplementation(() => ({
        erStegBehandlet: () => false,
        visVenteModal: false,
        erBehandlingReturnertFraBeslutter: () => returnertFraBeslutter,
        hentBehandlingMedBehandlingId: () => Promise.resolve(),
        settIkkePersistertKomponent: jest.fn(),
        nullstillIkkePersisterteKomponenter: jest.fn(),
    }));
};

describe('Tester: Totrinnskontroll', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    test('- vis og fyll ut - godkjenner', async () => {
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.Fakta,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.Vilkårsvurdering,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.ForeslåVedtak,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
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

    test('- vis og fyll ut - sender tilbake', async () => {
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.Fakta,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.Foreldelse,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.Vilkårsvurdering,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.ForeslåVedtak,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByTestId, getAllByRole } = renderTotrinnskontroll(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
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

    test('- vis utfylt - sendt tilbake', async () => {
        setupMock(true, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.Fakta,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.Foreldelse,
                    godkjent: false,
                    begrunnelse: 'Foreldelse må vurderes på nytt',
                },
                {
                    behandlingssteg: Behandlingssteg.Vilkårsvurdering,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.ForeslåVedtak,
                    godkjent: false,
                    begrunnelse: 'Vedtaket må vurderes på nytt',
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
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

    test('- vis utfylt - foreslått på nytt - lesevisning (rolle saksbehandler)', async () => {
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.Fakta,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.Foreldelse,
                    godkjent: false,
                    begrunnelse: 'Foreldelse må vurderes på nytt',
                },
                {
                    behandlingssteg: Behandlingssteg.Vilkårsvurdering,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.ForeslåVedtak,
                    godkjent: false,
                    begrunnelse: 'Vedtaket må vurderes på nytt',
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getAllByText, getAllByRole, queryByRole } = renderTotrinnskontroll(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
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
