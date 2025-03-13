import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import SendMelding from './SendMelding';
import { SendMeldingProvider } from './SendMeldingContext';
import { useDokumentApi } from '../../../../api/dokument';
import { useBehandling } from '../../../../context/BehandlingContext';
import { DokumentMal, Fagsystem } from '../../../../kodeverk';
import { Målform } from '../../../../typer/fagsak';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

jest.mock('../../../../api/http/HttpProvider', () => {
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

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

describe('Tester: SendMelding', () => {
    test('- fyller ut skjema og sender varsel', async () => {
        const user = userEvent.setup();
        // @ts-expect-error mock
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole, queryByRole, queryByText } = render(
            <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
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

        await act(() => user.selectOptions(getByLabelText('Mal'), DokumentMal.Varsel));

        expect(
            getByRole('button', {
                name: 'Send brev',
            })
        ).toBeDisabled();

        expect(getByText('Bokmål')).toBeTruthy();
        await act(() =>
            user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev')
        );

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

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Send brev',
                })
            )
        );
    });

    test('- fyller ut skjema og sender korrigert varsel', async () => {
        const user = userEvent.setup();
        // @ts-expect-error mock
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nn,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole, queryByText } = render(
            <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
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

        await act(() => user.selectOptions(getByLabelText('Mal'), DokumentMal.KorrigertVarsel));

        expect(getByText('Nynorsk')).toBeTruthy();
        await act(() =>
            user.type(getByRole('textbox', { name: 'Fritekst' }), 'Fritekst i varselbrev')
        );

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Send brev',
                })
            )
        );
    });

    test('- fyller ut skjema og sender innhent dokumentasjon', async () => {
        const user = userEvent.setup();
        // @ts-expect-error mock
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: false,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: true,
            manuelleBrevmottakere: [],
            eksternBrukId: '1',
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByLabelText, getByRole } = render(
            <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
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

        await act(() =>
            user.selectOptions(getByLabelText('Mal'), DokumentMal.InnhentDokumentasjon)
        );
        await act(() =>
            user.type(
                getByRole('textbox', {
                    name: 'Liste over dokumenter (skriv ett dokument pr. linje)',
                }),
                'Liste over dokument'
            )
        );

        expect(
            getByRole('button', {
                name: 'Forhåndsvis',
            })
        ).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Send brev',
                })
            )
        );
    });

    test('- lesevisning - venter på svar på manuelt brev', async () => {
        // @ts-expect-error mock
        useDokumentApi.mockImplementation(() => ({
            bestillBrev: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mock
        useBehandling.mockImplementation(() => ({
            behandlingILesemodus: true,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
        }));
        const behandling = mock<IBehandling>({
            varselSendt: false,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>({
            språkkode: Målform.Nb,
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
        });

        const { getByText, getByRole, queryByLabelText } = render(
            <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
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
