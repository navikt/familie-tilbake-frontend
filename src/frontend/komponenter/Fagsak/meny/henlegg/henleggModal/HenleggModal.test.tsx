import type { BehandlingApiHook } from '../../../../../api/behandling';
import type { Http } from '../../../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../../../context/BehandlingContext';
import type { BehandlingDto } from '../../../../../generated';
import type { Ressurs } from '../../../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import * as React from 'react';
import { vi } from 'vitest';

import { HenleggModal } from './HenleggModal';
import { FagsakContext } from '../../../../../context/FagsakContext';
import { lagBehandling } from '../../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../../testdata/fagsakFactory';
import { Behandlingresultat, Behandlingstype } from '../../../../../typer/behandling';
import { RessursStatus } from '../../../../../typer/ressurs';

vi.mock('../../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});
const mockUseBehandling = vi.fn();
vi.mock('../../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderHenleggModal = (
    behandling: BehandlingDto,
    årsaker: Behandlingresultat[]
): RenderResult => {
    const mockDialogRef = createRef<HTMLDialogElement | null>();
    const renderModal = render(
        <FagsakContext.Provider value={lagFagsak()}>
            <HenleggModal behandling={behandling} dialogRef={mockDialogRef} årsaker={årsaker} />
        </FagsakContext.Provider>
    );
    mockDialogRef.current?.showModal();

    return renderModal;
};

const setupMocks = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        henleggBehandling: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
    mockUseBehandling.mockImplementation(() => ({
        nullstillIkkePersisterteKomponenter: vi.fn(),
    }));
};

describe('HenleggModal', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        setupMocks();
    });

    test('Henlegger behandling med varsel sendt', async () => {
        const { getByLabelText, getByRole, queryByText, queryAllByText } = renderHenleggModal(
            lagBehandling({ varselSendt: true }),
            [Behandlingresultat.HenlagtFeilopprettet]
        );

        await waitFor(() => {
            expect(
                getByRole('heading', { name: 'Henlegg tilbakekrevingen', level: 1 })
            ).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');
        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
    });

    test('Henlegger behandling med varsel ikke sendt', async () => {
        const { getByLabelText, getByRole, queryByText, queryAllByText } = renderHenleggModal(
            lagBehandling(),
            [Behandlingresultat.HenlagtFeilopprettet]
        );

        await waitFor(() => {
            expect(
                getByRole('heading', { name: 'Henlegg tilbakekrevingen', level: 1 })
            ).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');
        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
    });

    test('Henlegger revurdering, med brev', async () => {
        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } =
            renderHenleggModal(lagBehandling({ type: Behandlingstype.RevurderingTilbakekreving }), [
                Behandlingresultat.HenlagtFeilopprettetMedBrev,
                Behandlingresultat.HenlagtFeilopprettetUtenBrev,
            ]);

        await waitFor(() => {
            expect(
                getByRole('heading', { name: 'Henlegg tilbakekrevingen', level: 1 })
            ).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Årsak til henleggelse'),
            Behandlingresultat.HenlagtFeilopprettetMedBrev
        );
        await user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
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
                name: 'Henlegg',
            })
        );
    });

    test('Henlegger revurdering, uten brev', async () => {
        const { getByLabelText, getByRole, queryByText, queryByRole, queryAllByText } =
            renderHenleggModal(lagBehandling({ type: Behandlingstype.RevurderingTilbakekreving }), [
                Behandlingresultat.HenlagtFeilopprettetMedBrev,
                Behandlingresultat.HenlagtFeilopprettetUtenBrev,
            ]);

        await waitFor(() => {
            expect(
                getByRole('heading', { name: 'Henlegg tilbakekrevingen', level: 1 })
            ).toBeInTheDocument();
        });

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            getByLabelText('Årsak til henleggelse'),
            Behandlingresultat.HenlagtFeilopprettetUtenBrev
        );
        await user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        expect(queryByText('Informer søker:')).not.toBeInTheDocument();
        expect(queryByText('Forhåndsvis brev')).not.toBeInTheDocument();
        expect(queryByRole('textbox', { name: 'Fritekst til brev' })).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Henlegg',
            })
        );
    });
});
