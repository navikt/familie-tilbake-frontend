import type { BehandlingApiHook } from '../../../../../api/behandling';
import type { Http } from '../../../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../../../context/BehandlingContext';
import type { Behandling } from '../../../../../typer/behandling';
import type { Ressurs } from '../../../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import HenleggBehandlingModal from './HenleggBehandlingModal';
import { Behandlingresultat, Behandlingstype } from '../../../../../typer/behandling';
import { RessursStatus } from '../../../../../typer/ressurs';

jest.mock('../../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});
const mockUseBehandling = jest.fn();
jest.mock('../../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderHenleggBehandlingModal = (
    behandling: Behandling,
    årsaker: Behandlingresultat[]
): RenderResult =>
    render(
        <HenleggBehandlingModal
            behandling={behandling}
            visModal
            settVisModal={() => jest.fn()}
            årsaker={årsaker}
        />
    );

describe('Tester: HenleggBehandlingModal', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    beforeEach(() => {
        mockUseBehandlingApi.mockImplementation(() => ({
            henleggBehandling: (): Promise<Ressurs<string>> => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        mockUseBehandling.mockImplementation(() => ({
            hentBehandlingMedBehandlingId: (): Promise<void> => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    });

    test('- henlegger behandling med varsel sendt', async () => {
        const behandling = mock<Behandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: true,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, [Behandlingresultat.HenlagtFeilopprettet]);

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
        const behandling = mock<Behandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: false,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, [Behandlingresultat.HenlagtFeilopprettet]);

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
        const behandling = mock<Behandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggBehandlingModal(behandling, [
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
        const behandling = mock<Behandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryByRole, queryAllByText } =
            renderHenleggBehandlingModal(behandling, [
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
