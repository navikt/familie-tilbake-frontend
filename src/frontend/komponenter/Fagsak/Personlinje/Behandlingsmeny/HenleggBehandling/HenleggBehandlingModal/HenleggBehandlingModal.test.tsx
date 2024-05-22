import * as React from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import HenleggBehandlingModal from './HenleggBehandlingModal';
import { useBehandlingApi } from '../../../../../../api/behandling';
import { useBehandling } from '../../../../../../context/BehandlingContext';
import {
    Behandlingresultat,
    Behandlingstype,
    IBehandling,
} from '../../../../../../typer/behandling';
import { IFagsak, Målform } from '../../../../../../typer/fagsak';

jest.mock('@navikt/familie-http', () => {
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
        // @ts-ignore
        useBehandlingApi.mockImplementation(() => ({
            henleggBehandling: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
        }));
    });

    test('- henlegger behandling med varsel sendt', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>({
            type: Behandlingstype.TILBAKEKREVING,
            varselSendt: true,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[Behandlingresultat.HENLAGT_FEILOPPRETTET]}
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
                Behandlingresultat.HENLAGT_FEILOPPRETTET
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
            type: Behandlingstype.TILBAKEKREVING,
            varselSendt: false,
        });
        const fagsak = mock<IFagsak>({});

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[Behandlingresultat.HENLAGT_FEILOPPRETTET]}
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
                Behandlingresultat.HENLAGT_FEILOPPRETTET
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
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NB,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryAllByText } = render(
            <HenleggBehandlingModal
                behandling={behandling}
                fagsak={fagsak}
                visModal={true}
                settVisModal={() => jest.fn()}
                årsaker={[
                    Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV,
                    Behandlingresultat.HENLAGT_FEILOPPRETTET_UTEN_BREV,
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
                Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV
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
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NB,
        });

        const { getByText, getByLabelText, getByRole, queryByText, queryByRole, queryAllByText } =
            render(
                <HenleggBehandlingModal
                    behandling={behandling}
                    fagsak={fagsak}
                    visModal={true}
                    settVisModal={() => jest.fn()}
                    årsaker={[
                        Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV,
                        Behandlingresultat.HENLAGT_FEILOPPRETTET_UTEN_BREV,
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
                Behandlingresultat.HENLAGT_FEILOPPRETTET_UTEN_BREV
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
