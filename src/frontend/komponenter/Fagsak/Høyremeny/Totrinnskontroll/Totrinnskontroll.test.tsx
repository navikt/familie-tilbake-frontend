import * as React from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import Totrinnskontroll from './Totrinnskontroll';
import { TotrinnskontrollProvider } from './TotrinnskontrollContext';
import { useBehandlingApi } from '../../../../api/behandling';
import { useBehandling } from '../../../../context/BehandlingContext';
import { Behandlingssteg, IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { ITotrinnkontroll } from '../../../../typer/totrinnTyper';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

describe('Tester: Totrinnskontroll', () => {
    const setupMock = (returnertFraBeslutter: boolean, totrinnkontroll: ITotrinnkontroll) => {
        // @ts-expect-error mock
        useBehandlingApi.mockImplementation(() => ({
            gjerTotrinnkontrollKall: () => {
                const ressurs = mock<Ressurs<ITotrinnkontroll>>({
                    status: RessursStatus.SUKSESS,
                    data: totrinnkontroll,
                });
                return Promise.resolve(ressurs);
            },
            sendInnFatteVedtak: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            erStegBehandlet: () => false,
            visVenteModal: false,
            erBehandlingReturnertFraBeslutter: () => returnertFraBeslutter,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    };

    test('- vis og fyll ut - godkjenner', async () => {
        const user = userEvent.setup();
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.FAKTA,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByTestId, getAllByRole } = render(
            <TotrinnskontrollProvider behandling={behandling} fagsak={fagsak}>
                <Totrinnskontroll />
            </TotrinnskontrollProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
        });

        expect(getAllByRole('link')).toHaveLength(3);

        expect(getByText('Tilbakekreving')).toBeTruthy();
        expect(getByText('Vedtak')).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            ).toBeDisabled();
            expect(
                getByRole('button', {
                    name: 'Send til saksbehandler',
                })
            ).toBeDisabled();
        });

        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_0-true')));
        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_1-true')));
        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_2-true')));

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            )
        );
    });

    test('- vis og fyll ut - sender tilbake', async () => {
        const user = userEvent.setup();
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.FAKTA,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORELDELSE,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
                    godkjent: undefined,
                    begrunnelse: undefined,
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByTestId, getAllByRole } = render(
            <TotrinnskontrollProvider behandling={behandling} fagsak={fagsak}>
                <Totrinnskontroll />
            </TotrinnskontrollProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeTruthy();
        expect(getByText('Tilbakekreving')).toBeTruthy();
        expect(getByText('Vedtak')).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Godkjenn vedtaket',
                })
            ).toBeDisabled();
            expect(
                getByRole('button', {
                    name: 'Send til saksbehandler',
                })
            ).toBeDisabled();
        });

        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_0-true')));
        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_1-true')));
        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_2-true')));
        await act(() => user.click(getByTestId('stegetGodkjent_idx_steg_3-false')));

        expect(
            getByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeDisabled();

        await act(() =>
            user.type(
                getByRole('textbox', {
                    name: 'Begrunnelse',
                }),
                'Vurder på nytt!!!!'
            )
        );

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Send til saksbehandler',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Send til saksbehandler',
                })
            )
        );
    });

    test('- vis utfylt - sendt tilbake', async () => {
        setupMock(true, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.FAKTA,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORELDELSE,
                    godkjent: false,
                    begrunnelse: 'Foreldelse må vurderes på nytt',
                },
                {
                    behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
                    godkjent: false,
                    begrunnelse: 'Vedtaket må vurderes på nytt',
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getAllByText, getAllByRole, queryByRole } = render(
            <TotrinnskontrollProvider behandling={behandling} fagsak={fagsak}>
                <Totrinnskontroll />
            </TotrinnskontrollProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeTruthy();
        expect(getByText('Tilbakekreving')).toBeTruthy();
        expect(getByText('Vedtak')).toBeTruthy();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).toBeFalsy();
        expect(
            queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeFalsy();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeTruthy();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeTruthy();
    });

    test('- vis utfylt - foreslått på nytt - lesevisning (rolle saksbehandler)', async () => {
        setupMock(false, {
            totrinnsstegsinfo: [
                {
                    behandlingssteg: Behandlingssteg.FAKTA,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORELDELSE,
                    godkjent: false,
                    begrunnelse: 'Foreldelse må vurderes på nytt',
                },
                {
                    behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
                    godkjent: true,
                    begrunnelse: undefined,
                },
                {
                    behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
                    godkjent: false,
                    begrunnelse: 'Vedtaket må vurderes på nytt',
                },
            ],
        });
        const behandling = mock<IBehandling>({
            kanEndres: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getAllByText, getAllByRole, queryByRole } = render(
            <TotrinnskontrollProvider behandling={behandling} fagsak={fagsak}>
                <Totrinnskontroll />
            </TotrinnskontrollProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
        });

        expect(getAllByRole('link')).toHaveLength(4);

        expect(getByText('Foreldelse')).toBeTruthy();
        expect(getByText('Tilbakekreving')).toBeTruthy();
        expect(getByText('Vedtak')).toBeTruthy();

        expect(
            queryByRole('button', {
                name: 'Godkjenn vedtaket',
            })
        ).toBeFalsy();
        expect(
            queryByRole('button', {
                name: 'Send til saksbehandler',
            })
        ).toBeFalsy();

        expect(getAllByText('Godkjent')).toHaveLength(2);
        expect(getAllByText('Vurder på nytt')).toHaveLength(2);
        expect(getByText('Foreldelse må vurderes på nytt')).toBeTruthy();
        expect(getByText('Vedtaket må vurderes på nytt')).toBeTruthy();
    });
});
