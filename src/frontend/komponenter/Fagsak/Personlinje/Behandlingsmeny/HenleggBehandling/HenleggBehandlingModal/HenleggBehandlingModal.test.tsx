import type { IBehandling } from '../../../../../../typer/behandling';
import type { IFagsak } from '../../../../../../typer/fagsak';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import HenleggBehandlingModal from './HenleggBehandlingModal';
import { Behandlingresultat, Behandlingstype } from '../../../../../../typer/behandling';
import { Målform } from '../../../../../../typer/fagsak';
import { type Ressurs, RessursStatus } from '../../../../../../typer/ressurs';

jest.mock('../../../../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});
const mockUseBehandling = jest.fn();
jest.mock('../../../../../../context/BehandlingContext', () => ({
    useBehandling: () => mockUseBehandling(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

const renderHenleggBehandlingModal = (
    behandling: IBehandling,
    fagsak: IFagsak,
    årsaker: Behandlingresultat[]
) =>
    render(
        <HenleggBehandlingModal
            behandling={behandling}
            fagsak={fagsak}
            visModal={true}
            settVisModal={() => jest.fn()}
            årsaker={årsaker}
        />
    );

describe('Tester: HenleggBehandlingModal', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    beforeEach(() => {
        mockUseBehandlingApi.mockImplementation(() => ({
            henleggBehandling: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        mockUseBehandling.mockImplementation(() => ({
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    });

    test('- henlegger behandling med varsel sendt', async () => {
        const behandling = mock<IBehandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: true,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, fagsak, [
                Behandlingresultat.HenlagtFeilopprettet,
            ]);

        await waitFor(() => {
            expect(getByText('Behandlingen henlegges')).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HenlagtFeilopprettet
        );
        await user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');

        expect(getByText('Informer søker:')).toBeInTheDocument();
        expect(getByText('Forhåndsvis brev')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
    });

    test('- henlegger behandling med varsel ikke sendt', async () => {
        const behandling = mock<IBehandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: false,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, fagsak, [
                Behandlingresultat.HenlagtFeilopprettet,
            ]);

        await waitFor(() => {
            expect(getByText('Behandlingen henlegges')).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HenlagtFeilopprettet
        );
        await user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
    });

    test('- henlegger revurdering, med brev', async () => {
        const behandling = mock<IBehandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, fagsak, [
                Behandlingresultat.HenlagtFeilopprettetMedBrev,
                Behandlingresultat.HenlagtFeilopprettetUtenBrev,
            ]);

        await waitFor(() => {
            expect(getByText('Behandlingen henlegges')).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HenlagtFeilopprettetMedBrev
        );
        await user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.type(
            getByRole('textbox', { name: 'Fritekst til brev' }),
            'Revurdering er feilopprettet'
        );

        expect(getByText('Informer søker:')).toBeInTheDocument();
        expect(getByText('Forhåndsvis brev')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
    });

    test('- henlegger revurdering, uten brev', async () => {
        const behandling = mock<IBehandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryByRole, queryAllByText } =
            renderHenleggBehandlingModal(behandling, fagsak, [
                Behandlingresultat.HenlagtFeilopprettetMedBrev,
                Behandlingresultat.HenlagtFeilopprettetUtenBrev,
            ]);

        await waitFor(() => {
            expect(getByText('Behandlingen henlegges')).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HenlagtFeilopprettetUtenBrev
        );
        await user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();
        expect(queryByRole('textbox', { name: 'Fritekst til brev' })).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
    });
});
