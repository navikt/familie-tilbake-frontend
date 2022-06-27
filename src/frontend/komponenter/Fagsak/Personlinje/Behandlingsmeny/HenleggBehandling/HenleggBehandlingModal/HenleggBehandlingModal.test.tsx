import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import ReactModal from 'react-modal';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../../../../api/behandling';
import { useBehandling } from '../../../../../../context/BehandlingContext';
import {
    Behandlingresultat,
    Behandlingstype,
    IBehandling,
} from '../../../../../../typer/behandling';
import { IFagsak, Målform } from '../../../../../../typer/fagsak';
import HenleggBehandlingModal from './HenleggBehandlingModal';

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
        ReactModal.setAppElement(document.createElement('div'));

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
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
    });

    test('- henlegger behandling med varsel sendt', async () => {
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

        userEvent.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HENLAGT_FEILOPPRETTET
        );
        userEvent.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');

        expect(getByText('Informer søker:')).toBeTruthy();
        expect(getByText('Forhåndsvis brev')).toBeTruthy();

        await waitFor(async () => {
            userEvent.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            );
        });
    });

    test('- henlegger behandling med varsel ikke sendt', async () => {
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

        userEvent.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HENLAGT_FEILOPPRETTET
        );
        userEvent.type(getByLabelText('Begrunnelse'), 'Feilutbetalingen er mottregnet');

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        await waitFor(async () => {
            userEvent.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            );
        });
    });

    test('- henlegger revurdering, med brev', async () => {
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

        userEvent.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV
        );
        userEvent.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        userEvent.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();

        userEvent.type(
            getByRole('textbox', { name: 'Fritekst til brev' }),
            'Revurdering er feilopprettet'
        );

        expect(getByText('Informer søker:')).toBeTruthy();
        expect(getByText('Forhåndsvis brev')).toBeTruthy();

        await waitFor(async () => {
            userEvent.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            );
        });
    });

    test('- henlegger revurdering, uten brev', async () => {
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

        userEvent.click(
            getByRole('button', {
                name: 'Henlegg behandling',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.selectOptions(
            getByLabelText('Velg årsak'),
            Behandlingresultat.HENLAGT_FEILOPPRETTET_UTEN_BREV
        );
        userEvent.type(getByLabelText('Begrunnelse'), 'Revurdering er feilopprettet');

        expect(queryByText('Informer søker:')).toBeFalsy();
        expect(queryByText('Forhåndsvis brev')).toBeFalsy();
        expect(queryByRole('textbox', { name: 'Fritekst til brev' })).toBeFalsy();

        await waitFor(async () => {
            userEvent.click(
                getByRole('button', {
                    name: 'Henlegg behandling',
                })
            );
        });
    });
});
