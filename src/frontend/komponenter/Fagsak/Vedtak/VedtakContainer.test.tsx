import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    BeregningsresultatPeriode,
    IBeregningsresultat,
    VedtaksbrevAvsnitt,
} from '../../../typer/vedtakTyper';

import { render, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { FeilutbetalingVedtakProvider } from './FeilutbetalingVedtakContext';
import VedtakContainer from './VedtakContainer';
import { Avsnittstype, Underavsnittstype, Vedtaksresultat, Vurdering } from '../../../kodeverk';
import { Behandlingstype, Behandlingårsak } from '../../../typer/behandling';
import { HarBrukerUttaltSegValg } from '../../../typer/feilutbetalingtyper';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: () => mockUseBehandling(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

const mockUseSammenslåPerioder = jest.fn();
jest.mock('../../../hooks/useSammenslåPerioder', () => ({
    useSammenslåPerioder: () => mockUseSammenslåPerioder(),
}));

const mockedSettIkkePersistertKomponent = jest.fn();

const renderVedtakContainer = (behandling: IBehandling, fagsak: IFagsak) =>
    render(
        <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
            <VedtakContainer behandling={behandling} fagsak={fagsak} />
        </FeilutbetalingVedtakProvider>
    );

describe('Tester: VedtakContainer', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });
    const perioder: BeregningsresultatPeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            vurdering: Vurdering.Forsett,
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
            vurdering: Vurdering.SimpelUaktsomhet,
            andelAvBeløp: 91,
            renteprosent: 0,
            tilbakekrevingsbeløp: 1223,
            tilbakekrevesBeløpEtterSkatt: 1223,
        },
    ];
    const beregningsresultat: IBeregningsresultat = {
        beregningsresultatsperioder: perioder,
        vedtaksresultat: Vedtaksresultat.DelvisTilbakebetaling,
        vurderingAvBrukersUttalelse: { harBrukerUttaltSeg: HarBrukerUttaltSegValg.Nei },
    };
    const avsnitt: VedtaksbrevAvsnitt[] = [
        {
            avsnittstype: Avsnittstype.Oppsummering,
            overskrift: 'Du må betale tilbake barnetrygden',
            underavsnittsliste: [],
        },
        {
            avsnittstype: Avsnittstype.Periode,
            overskrift: 'Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020',
            underavsnittsliste: [],
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        {
            avsnittstype: Avsnittstype.Periode,
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
        mockUseBehandlingApi.mockImplementation(() => ({
            gjerVedtaksbrevteksterKall: () => {
                const ressurs = mock<Ressurs<VedtaksbrevAvsnitt[]>>({
                    status: RessursStatus.Suksess,
                    data: avsnitt,
                });
                return Promise.resolve(ressurs);
            },
            gjerBeregningsresultatKall: () => {
                const ressurs = mock<Ressurs<IBeregningsresultat>>({
                    status: RessursStatus.Suksess,
                    data: resultat,
                });
                return Promise.resolve(ressurs);
            },
            sendInnForeslåVedtak: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));

        mockUseSammenslåPerioder.mockImplementation(() => ({
            hentErPerioderLike: () => Promise.resolve(),
            hentErPerioderSammenslått: () => Promise.resolve(),
            erPerioderLike: false,
        }));

        mockUseBehandling.mockImplementation(() => ({
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    };

    test('- vis og fyll ut - 1 fritekst påkrevet', async () => {
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
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

        const { getByText, getAllByText, getByRole, queryByRole, queryByText } =
            renderVedtakContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        expect(getByText('Forsett')).toBeInTheDocument();
        expect(getByText('Simpel uaktsomhet')).toBeInTheDocument();
        expect(getAllByText('1 333')).toHaveLength(2);
        expect(getByText('2 666')).toBeInTheDocument();
        expect(getByText('90 %')).toBeInTheDocument();
        expect(getByText('91 %')).toBeInTheDocument();
        expect(getAllByText('1 222')).toHaveLength(2);
        expect(getAllByText('1 222')).toHaveLength(2);
        expect(getAllByText('2 445')).toHaveLength(2);

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            getByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toBeInTheDocument();

        await user.type(
            getByRole('textbox', {
                name: `Utdypende tekst`,
            }),
            'Fritekst påkrevet'
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        );
    });

    test('- vis og fyll ut - 2 fritekst påkrevet - revurdering nye opplysninger', async () => {
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                        {
                            underavsnittstype: Underavsnittstype.Vilkår,
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
            type: Behandlingstype.RevurderingTilbakekreving,
            behandlingsårsakstype: Behandlingårsak.RevurderingOpplysningerOmVilkår,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByRole, queryByText } =
            renderVedtakContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await user.type(
            getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        );
    });

    test('- vis og fyll ut - 2 fritekst påkrevet - revurdering klage KA', async () => {
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                        },
                        {
                            underavsnittstype: Underavsnittstype.Vilkår,
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
            type: Behandlingstype.RevurderingTilbakekreving,
            behandlingsårsakstype: Behandlingårsak.RevurderingKlageKa,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByRole } =
            renderVedtakContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(getByText('Vedtaksbrev sendes ikke ut fra denne behandlingen.')).toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await user.type(
            getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await user.click(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('- vis og fyll ut - 1 fritekst påkrevet - fyller ut 1 ekstra fritekst - revurdering NFP', async () => {
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
                            brødtekst: 'Du har fått 1 333 kroner for mye utbetalt. ',
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                        },
                        {
                            underavsnittstype: Underavsnittstype.Vilkår,
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
            type: Behandlingstype.RevurderingTilbakekreving,
            behandlingsårsakstype: Behandlingårsak.RevurderingKlageNfp,
            manuelleBrevmottakere: [],
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getAllByRole, getByTestId, queryByText, queryByRole } =
            renderVedtakContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(
            queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeDisabled();
        });

        expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(1);
        expect(
            queryByRole('button', {
                name: 'Legg til utdypende tekst',
            })
        ).not.toBeInTheDocument();

        await user.click(
            within(
                getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button')
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
        await user.click(getByTestId('legg-til-fritekst-idx_avsnitt_2-idx_underavsnitt_0'));

        await user.type(
            getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst ekstra'
        );

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });

        await user.click(
            getByRole('button', {
                name: 'Til godkjenning',
            })
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('- vis utfylt - 1 fritekst påkrevet - 1 ekstra fritekst', async () => {
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
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

        const { getByText, getByRole, getByTestId, queryByRole } = renderVedtakContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Til godkjenning',
                })
            ).toBeEnabled();
        });
        expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();

        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

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

        await user.click(
            within(
                getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button')
        );
        await user.click(
            within(
                getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button')
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
                            underavsnittstype: Underavsnittstype.Fakta,
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
                            underavsnittstype: Underavsnittstype.Fakta,
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

        const { getByText, getByRole, queryByRole } = renderVedtakContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        expect(
            queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        expect(
            queryByRole('button', {
                name: 'Til godkjenning',
            })
        ).not.toBeInTheDocument();

        await waitFor(() => {
            expect(getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        });
        expect(
            getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

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

        await user.click(
            within(
                getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button')
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

        await user.click(
            within(
                getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button')
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

        expect(getByText('Denne friteksten var påkrevet')).toBeInTheDocument();
        expect(getByText('Denne friteksten var lagt til ekstra')).toBeInTheDocument();
    });
});
