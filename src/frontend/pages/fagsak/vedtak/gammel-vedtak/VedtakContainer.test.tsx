import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { SammenslåttPeriodeHook } from '~/hooks/useSammenslåPerioder';
import type { Ressurs } from '~/typer/ressurs';
import type {
    BeregningsresultatPeriode,
    Beregningsresultat,
    VedtaksbrevAvsnitt,
} from '~/typer/vedtakTyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { Underavsnittstype, Vurdering } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import {
    lagOppsummeringAvsnitt,
    lagPeriode2Avsnitt,
    lagPeriodeAvsnitt,
    lagVedaksbrevUnderavsnitt,
} from '~/testdata/vedtakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';
import { HarBrukerUttaltSegValg } from '~/typer/tilbakekrevingstyper';

import { VedtakContainer } from './VedtakContainer';
import { VedtakProvider } from './VedtakContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const mockUseSammenslåPerioder = vi.fn();
vi.mock('~/hooks/useSammenslåPerioder', () => ({
    useSammenslåPerioder: (): SammenslåttPeriodeHook => mockUseSammenslåPerioder(),
}));

const mockedSettIkkePersistertKomponent = vi.fn();

const renderVedtakContainer = (behandling: BehandlingDto, lesemodus: boolean = false): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{
                        behandlingILesemodus: lesemodus,
                        setIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
                    }}
                >
                    <VedtakProvider>
                        <VedtakContainer />
                    </VedtakProvider>
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

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
const beregningsresultat: Beregningsresultat = {
    beregningsresultatsperioder: perioder,
    vedtaksresultat: 'DelvisTilbakebetaling',
    vurderingAvBrukersUttalelse: { harBrukerUttaltSeg: HarBrukerUttaltSegValg.Nei },
};

const setupMock = (avsnitt: VedtaksbrevAvsnitt[], resultat: Beregningsresultat): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVedtaksbrevteksterKall: (): Promise<Ressurs<VedtaksbrevAvsnitt[]>> => {
            const ressurs: Ressurs<VedtaksbrevAvsnitt[]> = {
                status: RessursStatus.Suksess,
                data: avsnitt,
            };
            return Promise.resolve(ressurs);
        },
        gjerBeregningsresultatKall: (): Promise<Ressurs<Beregningsresultat>> => {
            const ressurs: Ressurs<Beregningsresultat> = {
                status: RessursStatus.Suksess,
                data: resultat,
            };
            return Promise.resolve(ressurs);
        },
        sendInnForeslåVedtak: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));

    mockUseSammenslåPerioder.mockImplementation(() => ({
        hentErPerioderLike: (): Promise<boolean> => Promise.resolve(false),
        hentErPerioderSammenslått: (): Promise<boolean> => Promise.resolve(false),
    }));
};

describe('VedtakContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut - 1 fritekst påkrevet', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);
        renderVedtakContainer(lagBehandling());

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByText('01.05.2020–30.06.2020')).toBeInTheDocument();
        expect(screen.getByText('Forsett')).toBeInTheDocument();
        expect(screen.getByText('Simpel uaktsomhet')).toBeInTheDocument();
        expect(screen.getAllByText('1 333')).toHaveLength(2);
        expect(screen.getByText('2 666')).toBeInTheDocument();
        expect(screen.getByText('90 %')).toBeInTheDocument();
        expect(screen.getByText('91 %')).toBeInTheDocument();
        expect(screen.getAllByText('1 222')).toHaveLength(2);
        expect(screen.getAllByText('1 222')).toHaveLength(2);
        expect(screen.getAllByText('2 445')).toHaveLength(2);

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeDisabled();

        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toBeInTheDocument();

        await user.type(
            screen.getByRole('textbox', {
                name: `Utdypende tekst`,
            }),
            'Fritekst påkrevet'
        );

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );
    });

    test('Vis og fyll ut - 2 fritekst påkrevet - revurdering nye opplysninger', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Vilkår,
                    overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                    brødtekst: 'Dette er en tekst!',
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);
        renderVedtakContainer(
            lagBehandling({
                type: 'REVURDERING_TILBAKEKREVING',
                behandlingsårsakstype: 'REVURDERING_OPPLYSNINGER_OM_VILKÅR',
            })
        );

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeDisabled();

        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            screen.getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );
    });

    test('Vis og fyll ut - 2 fritekst påkrevet - revurdering klage KA', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Vilkår,
                    overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                    brødtekst: 'Dette er en tekst!',
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);

        renderVedtakContainer(
            lagBehandling({
                type: 'REVURDERING_TILBAKEKREVING',
                behandlingsårsakstype: 'REVURDERING_KLAGE_KA',
            })
        );

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.getByText('Vedtaksbrev sendes ikke ut fra denne behandlingen.')
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeDisabled();

        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            screen.getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(2);

        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('Vis og fyll ut - 1 fritekst påkrevet - fyller ut 1 ekstra fritekst - revurdering NFP', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                }),
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Vilkår,
                    overskrift: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                    brødtekst: 'Dette er en tekst!',
                    fritekstTillatt: true,
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);
        renderVedtakContainer(
            lagBehandling({
                type: 'REVURDERING_TILBAKEKREVING',
                behandlingsårsakstype: 'REVURDERING_KLAGE_NFP',
            })
        );

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.queryByText(
                'Vedtaksbrev sendes ikke ut fra denne behandlingen, men må sendes av saksbehandler fra klagebehandlingen'
            )
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeDisabled();

        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            screen.getAllByRole('textbox', {
                name: `Utdypende tekst`,
            })
        ).toHaveLength(1);
        expect(
            screen.queryByRole('button', {
                name: 'Legg til utdypende tekst',
            })
        ).not.toBeInTheDocument();

        await user.click(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        );

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(
            screen.getAllByRole('button', {
                name: 'Legg til utdypende tekst Legg til utdypende tekst',
            })
        ).toHaveLength(2);
        await user.click(screen.getByTestId('legg-til-fritekst-idx_avsnitt_2-idx_underavsnitt_0'));

        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0'),
            'Fritekst påkrevet'
        );
        await user.type(
            screen.getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0'),
            'Fritekst ekstra'
        );

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('vedtak');
    });

    test('Vis utfylt - 1 fritekst påkrevet - 1 ekstra fritekst', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                    fritekst: 'Denne friteksten var påkrevet',
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekst: 'Denne friteksten var lagt til ekstra',
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);

        renderVedtakContainer(lagBehandling());

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).toBeEnabled();
        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();

        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'false');

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'false');

        await user.click(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        );
        await user.click(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        );

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(screen.getByTestId('fritekst-idx_avsnitt_1-idx_underavsnitt_0')).toHaveValue(
            'Denne friteksten var påkrevet'
        );
        expect(screen.getByTestId('fritekst-idx_avsnitt_2-idx_underavsnitt_0')).toHaveValue(
            'Denne friteksten var lagt til ekstra'
        );
    });

    test('Vis utfylt - lesevisning', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: true,
                    fritekst: 'Denne friteksten var påkrevet',
                }),
            ]),
            lagPeriode2Avsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekst: 'Denne friteksten var lagt til ekstra',
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);

        renderVedtakContainer(lagBehandling(), true);

        expect(await screen.findByText('Vedtak')).toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Forhåndsvis vedtaksbrev',
            })
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        ).not.toBeInTheDocument();

        expect(screen.getByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020')
        ).toBeInTheDocument();

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'false');

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'false');

        await user.click(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        );

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'false');

        await user.click(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        );

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(
            within(
                screen.getByRole('region', {
                    name: `Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020`,
                })
            ).getByRole('button', { name: 'Vis mer' })
        ).toHaveAttribute('aria-expanded', 'true');

        expect(screen.getByText('Denne friteksten var påkrevet')).toBeInTheDocument();
        expect(screen.getByText('Denne friteksten var lagt til ekstra')).toBeInTheDocument();
    });

    test('Viser bekreftelsesmodal når bruker klikker Send til godkjenning', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: false,
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);
        renderVedtakContainer(lagBehandling({ kanEndres: true, erNyModell: true }));

        expect(await screen.findByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Avbryt',
            })
        ).toBeInTheDocument();
    });

    test('Lukker bekreftelsesmodal etter vellykket sending til godkjenning', async () => {
        const vedtaksbrevAvsnitt = [
            lagOppsummeringAvsnitt(),
            lagPeriodeAvsnitt([
                lagVedaksbrevUnderavsnitt({
                    underavsnittstype: Underavsnittstype.Fakta,
                    brødtekst: 'Du har fått 1 333 kroner for mye utbetalt.',
                    fritekstTillatt: true,
                    fritekstPåkrevet: false,
                }),
            ]),
        ];
        setupMock(vedtaksbrevAvsnitt, beregningsresultat);
        renderVedtakContainer(lagBehandling({ kanEndres: true }));

        expect(await screen.findByText('Du må betale tilbake barnetrygden')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Send til godkjenning hos beslutter',
            })
        );

        const modal = screen.getByRole('dialog');

        await user.click(
            within(modal).getByRole('button', {
                name: 'Send til godkjenning',
            })
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
