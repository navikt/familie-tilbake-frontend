import * as React from 'react';

import { act, render, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { FeilutbetalingVedtakProvider } from './FeilutbetalingVedtakContext';
import VedtakContainer from './VedtakContainer';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Avsnittstype, Underavsnittstype, Vedtaksresultat, Vurdering } from '../../../kodeverk';
import { Behandlingstype, Behandlingårsak, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    BeregningsresultatPeriode,
    IBeregningsresultat,
    VedtaksbrevAvsnitt,
} from '../../../typer/vedtakTyper';

jest.mock('@navikt/familie-http', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

const mockedSettIkkePersistertKomponent = jest.fn();

describe('Tester: VedtakContainer', () => {
    const perioder: BeregningsresultatPeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 90,
            renteprosent: 0,
            tilbakekrevingsbeløp: 1222,
            tilbakekrevesBeløpEtterSkatt: 1222,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-05-01',
                tom: '2020-06-30',
            },
            vurdering: Vurdering.SIMPEL_UAKTSOMHET,
            andelAvBeløp: 91,
            renteprosent: 0,
            tilbakekrevingsbeløp: 1223,
            tilbakekrevesBeløpEtterSkatt: 1223,
        },
    ];
    const beregningsresultat: IBeregningsresultat = {
        beregningsresultatsperioder: perioder,
        vedtaksresultat: Vedtaksresultat.DELVIS_TILBAKEBETALING,
    };
    const avsnitt: VedtaksbrevAvsnitt[] = [
        {
            avsnittstype: Avsnittstype.OPPSUMMERING,
            overskrift: 'Du må betale tilbake barnetrygden',
            underavsnittsliste: [],
        },
        {
            avsnittstype: Avsnittstype.PERIODE,
            overskrift: 'Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020',
            underavsnittsliste: [],
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        {
            avsnittstype: Avsnittstype.PERIODE,
            overskrift: 'Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020',
            underavsnittsliste: [],
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
    ];

    const setupMock = (
        lesevisning: boolean,
        avsnitt: VedtaksbrevAvsnitt[],
        resultat: IBeregningsresultat
    ) => {
        // @ts-ignore
        useBehandlingApi.mockImplementation(() => ({
            gjerVedtaksbrevteksterKall: () => {
                const ressurs = mock<Ressurs<VedtaksbrevAvsnitt[]>>({
                    status: RessursStatus.SUKSESS,
                    data: avsnitt,
                });
                return Promise.resolve(ressurs);
            },
            gjerBeregningsresultatKall: () => {
                const ressurs = mock<Ressurs<IBeregningsresultat>>({
                    status: RessursStatus.SUKSESS,
                    data: resultat,
                });
                return Promise.resolve(ressurs);
            },
            sendInnForeslåVedtak: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    };

    test('- vis og fyll ut - 1 fritekst påkrevet', async () => {
        const user = userEvent.setup();
        setupMock(
            false,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getAllByText, getByRole, queryByRole, queryByText } = render(
            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                <VedtakContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVedtakProvider>
        );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).toBeFalsy();

        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();
        expect(getByText('Forsett')).toBeTruthy();
        expect(getByText('Simpel uaktsomhet')).toBeTruthy();
        expect(getAllByText('1 333')).toHaveLength(2);
        expect(getByText('2 666')).toBeTruthy();
        expect(getByText('90 %')).toBeTruthy();
        expect(getByText('91 %')).toBeTruthy();
        expect(getAllByText('1 222')).toHaveLength(2);
        expect(getAllByText('1 222')).toHaveLength(2);
        expect(getAllByText('2 445')).toHaveLength(2);

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toBeTruthy();

        await act(() =>
            user.type(
                getByRole('textbox', {
                    name: `Utdypende tekst`,
                }),
                'Fritekst påkrevet'
            )
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            )
        );
    });

    test('- vis og fyll ut - 2 fritekst påkrevet - revurdering nye opplysninger', async () => {
        const user = userEvent.setup();
        setupMock(
            false,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                        {
                            underavsnittstype: Underavsnittstype.VILKÅR,
                            overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                            brødtekst: 'Dette er en tekst!',
                            fritekstTillatt: false,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            behandlingsårsakstype: Behandlingårsak.REVURDERING_OPPLYSNINGER_OM_VILKÅR,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByRole, queryByText } =
            render(
                <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                    <VedtakContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVedtakProvider>
            );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).toBeFalsy();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'), 'Fritekst påkrevet')
        );
        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'), 'Fritekst påkrevet')
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            )
        );
    });

    test('- vis og fyll ut - 2 fritekst påkrevet - revurdering klage KA', async () => {
        const user = userEvent.setup();
        setupMock(
            false,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                        {
                            underavsnittstype: Underavsnittstype.VILKÅR,
                            overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                            brødtekst: 'Dette er en tekst!',
                            fritekstTillatt: false,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            behandlingsårsakstype: Behandlingårsak.REVURDERING_KLAGE_KA,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByRole } = render(
            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                <VedtakContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVedtakProvider>
        );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(getByText('Vedtaksbrev sendes ikke ut fra denne behandlingen.')).toBeTruthy();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeFalsy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'), 'Fritekst påkrevet')
        );
        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'), 'Fritekst påkrevet')
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeFalsy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            )
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('- vis og fyll ut - 1 fritekst påkrevet - fyller ut 1 ekstra fritekst - revurdering NFP', async () => {
        const user = userEvent.setup();
        setupMock(
            false,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                        {
                            underavsnittstype: Underavsnittstype.VILKÅR,
                            overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                            brødtekst: 'Dette er en tekst!',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            behandlingsårsakstype: Behandlingårsak.REVURDERING_KLAGE_NFP,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByText, queryByRole } =
            render(
                <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                    <VedtakContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVedtakProvider>
            );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).toBeFalsy();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(1);
        expect(
            queryByRole('button', {
                name: 'Legg til utdypende tekst',
            })
        ).toBeFalsy();

        await act(() =>
            user.click(
                within(
                    getByRole('region', {
                        name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                    })
                ).getByRole('button')
            )
        );

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(
            getAllByRole('button', {
                name: 'Legg til utdypende tekst Legg til utdypende tekst',
            })
        ).toHaveLength(2);
        await act(() =>
            user.click(getByTestId('legg-til-fritekst-idx_avsnitt_2-idx_underavsnitt_0'))
        );

        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'), 'Fritekst påkrevet')
        );
        await act(() =>
            user.type(getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'), 'Fritekst ekstra')
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            )
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('- vis utfylt - 1 fritekst påkrevet - 1 ekstra fritekst', async () => {
        const user = userEvent.setup();
        setupMock(
            false,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            fritekst: 'Denne friteksten var påkrevet',
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            fritekst: 'Denne friteksten var lagt til ekstra',
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByTestId, queryByRole } = render(
            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                <VedtakContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVedtakProvider>
        );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeTruthy();

        await waitFor(async () => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
            expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        });

        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
            })
        ).not.toHaveClass('navds-expansioncard--open');

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).not.toHaveClass('navds-expansioncard--open');

        await act(() =>
            user.click(
                within(
                    getByRole('region', {
                        name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                    })
                ).getByRole('button')
            )
        );
        await act(() =>
            user.click(
                within(
                    getByRole('region', {
                        name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                    })
                ).getByRole('button')
            )
        );

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0')).toHaveValue(
            'Denne friteksten var påkrevet'
        );
        expect(getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0')).toHaveValue(
            'Denne friteksten var lagt til ekstra'
        );
    });

    test('- vis utfylt - lesevisning', async () => {
        const user = userEvent.setup();
        setupMock(
            true,
            [
                {
                    ...avsnitt[0],
                    underavsnittsliste: [
                        {
                            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                    ],
                },
                {
                    ...avsnitt[1],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            fritekst: 'Denne friteksten var påkrevet',
                        },
                    ],
                },
                {
                    ...avsnitt[2],
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            fritekst: 'Denne friteksten var lagt til ekstra',
                        },
                    ],
                },
            ],
            beregningsresultat
        );
        const behandling = mock<IBehandling>({
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByRole } = render(
            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                <VedtakContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVedtakProvider>
        );

        await waitFor(async () => {
            expect(getByText('Vedtak')).toBeTruthy();
        });

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeFalsy();

        expect(
            queryByRole('button', {
                name: 'Til godkjenning',
            })
        ).toBeFalsy();

        await waitFor(async () => {
            expect(getByText('Du må betale tilbake barnetrygden')).toBeTruthy();
        });
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeTruthy();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeTruthy();

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
            })
        ).not.toHaveClass('navds-expansioncard--open');

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).not.toHaveClass('navds-expansioncard--open');

        await act(() =>
            user.click(
                within(
                    getByRole('region', {
                        name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                    })
                ).getByRole('button')
            )
        );

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).not.toHaveClass('navds-expansioncard--open');

        await act(() =>
            user.click(
                within(
                    getByRole('region', {
                        name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                    })
                ).getByRole('button')
            )
        );

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(
            getByRole('region', {
                name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
            })
        ).toHaveClass('navds-expansioncard--open');

        expect(getByText('Denne friteksten var påkrevet')).toBeTruthy();
        expect(getByText('Denne friteksten var lagt til ekstra')).toBeTruthy();
    });
});
