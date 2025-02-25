import type { IBehandling } from '../../../../../../typer/behandling';
import type { IFagsak } from '../../../../../../typer/fagsak';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import HenleggBehandlingModal from './HenleggBehandlingModal';
import { useBehandlingApi } from '../../../../../../api/behandling';
import { useBehandling } from '../../../../../../context/BehandlingContext';
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

jest.mock('../../../../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

describe('Tester: HenleggBehandlingModal', () => {
    beforeEach(() => {
        // @ts-expect-error mock
        useBehandlingApi.mockImplementation(() => ({
            henleggBehandling: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    });

    test('- henlegger behandling med varsel sendt', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: true,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[Behandlingresultat.HenlagtFeilopprettet]}
            />
        );

        await waitFor(async () => {
            expect(getByText('Behandlingen henlegges')).toBeTruthy();
        });

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.selectOptions(
                getByLabelText('Velg årsak'),
                Behandlingresultat.HenlagtFeilopprettet
            )
        );
        await act(() => user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet'));

        expect(getByText('Informer søker:')).toBeTruthy();
        expect(getByText('Forhåndsvis brev')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
    });

    test('- henlegger behandling med varsel ikke sendt', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>({
            type: Behandlingstype.Tilbakekreving,
            varselSendt: false,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[Behandlingresultat.HenlagtFeilopprettet]}
            />
        );

        await waitFor(async () => {
            expect(getByText('Behandlingen henlegges')).toBeTruthy();
        });

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.selectOptions(
                getByLabelText('Velg årsak'),
                Behandlingresultat.HenlagtFeilopprettet
            )
        );
        await act(() => user.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet'));

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
    });

    test('- henlegger revurdering, med brev', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[
                    Behandlingresultat.HenlagtFeilopprettetMedBrev,
                    Behandlingresultat.HenlagtFeilopprettetUtenBrev,
                ]}
            />
        );

        await waitFor(async () => {
            expect(getByText('Behandlingen henlegges')).toBeTruthy();
        });

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.selectOptions(
                getByLabelText('Velg årsak'),
                Behandlingresultat.HenlagtFeilopprettetMedBrev
            )
        );
        await act(() => user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet'));

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.type(
                getByRole('textbox', { name: 'Fritekst til brev' }),
                'Revurdering er feilopprettet'
            )
        );

        expect(getByText('Informer søker:')).toBeTruthy();
        expect(getByText('Forhåndsvis brev')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
    });

    test('- henlegger revurdering, uten brev', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>({
            type: Behandlingstype.RevurderingTilbakekreving,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryByRole, queryAllByText } =
            render(
                <HenleggBehandlingModal
                    behandling={behandling}
                    fagsak={fagsak}
                    visModal={true}
                    settVisModal={() => jest.fn()}
                    årsaker={[
                        Behandlingresultat.HenlagtFeilopprettetMedBrev,
                        Behandlingresultat.HenlagtFeilopprettetUtenBrev,
                    ]}
                />
            );

        await waitFor(async () => {
            expect(getByText('Behandlingen henlegges')).toBeTruthy();
        });

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.selectOptions(
                getByLabelText('Velg årsak'),
                Behandlingresultat.HenlagtFeilopprettetUtenBrev
            )
        );
        await act(() => user.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet'));

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();
        expect(queryByRole('textbox', { name: 'Fritekst til brev' })).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            )
        );
    });
});
