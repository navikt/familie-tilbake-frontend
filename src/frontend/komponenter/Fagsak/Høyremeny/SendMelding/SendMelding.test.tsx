import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useDokumentApi } from '../../../../api/dokument';
import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak, Målform } from '../../../../typer/fagsak';
import SendMelding from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';

jest.mock('@navikt/familie-http', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

jest.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../../api/dokument', () => ({
    useDokumentApi: jest.fn(),
}));

describe('Tester: SendMelding', () => {
    test('- fyller ut skjema og sender varsel', async () => {
        const user = userEvent.setup();
        // @ts-ignore
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NB,
        });

        const { getByText, getByLabelText, getByRole, queryByRole, queryByText } = render(
            <SendMeldingProvider behandling={behandling}>
                <SendMelding fagsak={fagsak} behandling={behandling} />
            </SendMeldingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Mottaker')).toBeTruthy();
            expect(getByLabelText('Mal')).toHaveLength(3);
            expect(queryByText('Bokmål')).toBeFalsy();
        });

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeFalsy();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.VARSEL);

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(getByText('Bokmål')).toBeTruthy();
        await user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- fyller ut skjema og sender korrigert varsel', async () => {
        const user = userEvent.setup();
        // @ts-ignore
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NN,
        });

        const { getByText, getByLabelText, getByRole, queryByText } = render(
            <SendMeldingProvider behandling={behandling}>
                <SendMelding fagsak={fagsak} behandling={behandling} />
            </SendMeldingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Mottaker')).toBeTruthy();
            expect(getByLabelText('Mal')).toHaveLength(3);
            expect(queryByText('Nynorsk')).toBeFalsy();
        });

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.KORRIGERT_VARSEL);

        expect(getByText('Nynorsk')).toBeTruthy();
        await user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev');

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- fyller ut skjema og sender innhent dokumentasjon', async () => {
        const user = userEvent.setup();
        // @ts-ignore
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NB,
        });

        const { getByText, getByLabelText, getByRole } = render(
            <SendMeldingProvider behandling={behandling}>
                <SendMelding fagsak={fagsak} behandling={behandling} />
            </SendMeldingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Mottaker')).toBeTruthy();
        });
        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        await user.selectOptions(getByLabelText('Mal'), DokumentMal.INNHENT_DOKUMENTASJON);
        await user.type(
            getByRole('textbox', { name: 'Liste over dokumenter (skriv ett dokument pr. linje)' }),
            'Liste over dokument'
        );

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Send brev',
            })
        );
    });

    test('- lesevisning - venter på svar på manuelt brev', async () => {
        // @ts-ignore
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: true,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.NB,
        });

        const { getByText, getByRole, queryByLabelText } = render(
            <SendMeldingProvider behandling={behandling}>
                <SendMelding fagsak={fagsak} behandling={behandling} />
            </SendMeldingProvider>
        );

        expect(getByText('Mottaker')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(queryByLabelText('Mal')).toBeFalsy();
        expect(getByText('Mal')).toBeTruthy();
        expect(getByText('Velg brev')).toBeTruthy();
    });
});
