import type { UserEvent } from '@testing-library/user-event';
import type {
    BehandlingLagreVilkaarsvurderingData,
    Moment,
    PeriodeInfo,
    Vilkaarsperiode,
    Vilkaarsvurdering,
} from '@/generated-new';
import type { Vilkårsperiode } from '../typer';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import {
    LAGRE_VILKÅRSVURDERING_MUTATION_KEY,
    VilkårsvurderingDetaljer,
} from '../VilkårsvurderingDetaljer';
import { VilkårsvurderingLesedataProvider } from '../VilkårsvurderingLesedataContext';

/**
 * Skjemaet i `VilkårsvurderingSkjema` sendes inn av `VilkårsvurderingDetaljer`,
 * som eier `FormProvider`, `zodResolver` og mutasjonen. Testene rendrer derfor
 * `VilkårsvurderingDetaljer` for å teste hele veien fra utfylling til
 * request-body, uten å duplisere innsendingslogikken.
 *
 * `renderSkjema` returnerer requesten som et løfte, slik at hver test kan
 * asserte på den med `await expect(sendtRequest).resolves.toEqual(...)`.
 */
const BEHANDLING_ID = 'behandling-1';
const PERIODE_ID = 'periode-1';
const FOM = '2024-01-01';
const TOM = '2024-01-31';

const delbarePerioder: PeriodeInfo[] = [{ periodeId: PERIODE_ID, periode: { fom: FOM, tom: TOM } }];

const GRAD_AV_UAKTSOMHET: Moment = {
    moment: 'GRAD_AV_UAKTSOMHET',
    beskrivelse: 'Graden av uaktsomhet',
};
const NAVS_FEIL: Moment = { moment: 'NAVS_FEIL', beskrivelse: 'Om feilen kan tilskrives Nav' };
const ANNET: Moment = { moment: 'ANNET', beskrivelse: 'Annet' };
const STØRRELSE_PÅ_BELØPET: Moment = {
    moment: 'STØRRELSE_PÅ_BELØPET',
    beskrivelse: 'Størrelsen på beløpet',
};
const TID_SIDEN_UTBETALING: Moment = {
    moment: 'TID_SIDEN_UTBETALING',
    beskrivelse: 'Tiden som har gått siden utbetalingen',
};

const momenterSærligeGrunner: Moment[] = [GRAD_AV_UAKTSOMHET, NAVS_FEIL, ANNET];
const momenterReduksjonGodTro: Moment[] = [STØRRELSE_PÅ_BELØPET, TID_SIDEN_UTBETALING, ANNET];

const vilkårsvurdering: Vilkaarsvurdering = {
    id: PERIODE_ID,
    fom: FOM,
    tom: TOM,
    delbarePerioder,
    valg: { vurdering: 'ikke_vurdert' },
};

const valgtPeriode: Vilkårsperiode = {
    id: PERIODE_ID,
    fom: '01.01.2024',
    tom: '31.01.2024',
    feilutbetalt: 10000,
    vurdering: 'IKKE_VURDERT',
    resultat: 'FULL_TILBAKEKREVING',
    rettsligGrunnlag: [],
};

const vilkårsperiode: Vilkaarsperiode = {
    feilutbetaltBeløp: 10000,
    delresultat: 'FULL_TILBAKEKREVING',
    fakta: { rettsligGrunnlag: [] },
    simulertBeløp: 10000,
    vilkårsvurdering,
};

type RenderProps = {
    erUnder4xRettsgebyr?: boolean;
};

const renderSkjema = ({
    erUnder4xRettsgebyr = false,
}: RenderProps = {}): Promise<BehandlingLagreVilkaarsvurderingData> => {
    const client = createTestQueryClient();
    const sendtRequest = new Promise<BehandlingLagreVilkaarsvurderingData>(resolve => {
        client.setMutationDefaults(LAGRE_VILKÅRSVURDERING_MUTATION_KEY, {
            mutationFn: async (vilkårsvurdering: BehandlingLagreVilkaarsvurderingData) => {
                resolve(vilkårsvurdering);
                return undefined;
            },
        });
    });

    render(
        <QueryClientProvider client={client}>
            <TestBehandlingProvider behandling={lagBehandling({ behandlingId: BEHANDLING_ID })}>
                <VilkårsvurderingLesedataProvider
                    momenterSærligeGrunner={momenterSærligeGrunner}
                    momenterReduksjonGodTro={momenterReduksjonGodTro}
                    erUnder4xRettsgebyr={erUnder4xRettsgebyr}
                >
                    <VilkårsvurderingDetaljer
                        valgtPeriode={valgtPeriode}
                        vilkårsperioder={[vilkårsperiode]}
                        hentVilkårsvurdering={(): void => undefined}
                    />
                </VilkårsvurderingLesedataProvider>
            </TestBehandlingProvider>
        </QueryClientProvider>
    );

    return sendtRequest;
};

const lagreKnapp = (): HTMLElement => screen.getByRole('button', { name: /Lagre/ });

const radio = (navn: string | RegExp): HTMLElement => screen.getByRole('radio', { name: navn });

const radioIGruppe = (gruppenavn: string, navn: string): HTMLElement =>
    within(screen.getByRole('radiogroup', { name: gruppenavn })).getByRole('radio', { name: navn });

const avkryssningsboks = (gruppenavn: string | RegExp, navn: string): HTMLElement =>
    within(screen.getByRole('group', { name: gruppenavn })).getByRole('checkbox', { name: navn });

const tekstfelt = (navn: string | RegExp): HTMLElement =>
    screen.getByRole('textbox', { name: navn });

const tallfelt = (navn: string | RegExp): HTMLElement =>
    screen.getByRole('spinbutton', { name: navn });

const VILKÅR_FORSTO_ELLER_BURDE_FORSTÅTT = /forsto eller burde forstått/;
const VILKÅR_FORÅRSAKET_AV_MOTTAKER = /forsettlig eller uaktsomt gi feilaktige/;
const VILKÅR_GOD_TRO = /aktsom god tro/;

const SÆRLIGE_GRUNNER_LEGEND = 'Er det særlige grunner til å redusere beløpet?';
const SÆRLIGE_GRUNNER_FOR_LEGEND = 'Hvilke særlige grunner taler for å redusere beløpet?';
const SÆRLIGE_GRUNNER_MOT_LEGEND = 'Hvilke særlige grunner taler mot å redusere beløpet?';

describe('VilkårsvurderingSkjema', () => {
    let user: UserEvent;

    beforeAll(() => {
        user = userEvent.setup({ delay: null });
    });

    describe('Payload per gren', () => {
        test('burde sende hele vilkårsvurderingen for "forsto eller burde forstått" når mottakeren forsto', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORSTO_ELLER_BURDE_FORSTÅTT));
            await user.click(radio('Mottakeren forsto at utbetalingen skyldtes en feil'));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren forsto at utbetalingen skyldtes en feil'
                ),
                'Mottakeren fikk tydelig beskjed'
            );
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Nei'));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_MOT_LEGEND, NAVS_FEIL.beskrivelse));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet'
                ),
                'Feilen kan ikke tilskrives Nav'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'forsto_eller_burde_forstått',
                        forståelse: {
                            forståelse: 'forsto',
                            begrunnelse: 'Mottakeren fikk tydelig beskjed',
                            unnlatelse: {
                                unnlatelse: 'ikkeAktuelt',
                                erDetSærligeGrunner: {
                                    erDetSaerligeGrunner: 'nei',
                                    særligeGrunnerMot: [NAVS_FEIL],
                                    begrunnelse: 'Feilen kan ikke tilskrives Nav',
                                    annetBegrunnelse: null,
                                },
                            },
                        },
                    },
                },
            });
        });

        test('burde sende unnlatelsesgrenen "skalUnnlates" uten særlige grunner når beløpet er under fire ganger rettsgebyret', async () => {
            const sendtRequest = renderSkjema({ erUnder4xRettsgebyr: true });

            await user.click(radio(VILKÅR_FORSTO_ELLER_BURDE_FORSTÅTT));
            await user.click(radio('Mottakeren burde forstått at utbetalingen skyldtes en feil'));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren burde forstått at utbetalingen skyldtes en feil'
                ),
                'Mottakeren burde undersøkt'
            );
            await user.click(
                radioIGruppe('Skal Nav la være å kreve beløpet tilbake? (Sjette avsnitt)', 'Ja')
            );
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at Nav skal la være å kreve beløpet tilbake'
                ),
                'Beløpet er lavt'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'forsto_eller_burde_forstått',
                        forståelse: {
                            forståelse: 'burdeForstått',
                            begrunnelse: 'Mottakeren burde undersøkt',
                            unnlatelse: {
                                unnlatelse: 'skalUnnlates',
                                begrunnelse: 'Beløpet er lavt',
                            },
                        },
                    },
                },
            });
        });

        test('burde sende kun begrunnelsen for "forårsaket av mottaker" når aktsomheten er forsett', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Forsett'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'),
                'Mottakeren ga bevisst feil opplysninger'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'forsettlig',
                            begrunnelse: 'Mottakeren ga bevisst feil opplysninger',
                        },
                    },
                },
            });
        });

        test('burde sende særlige grunner med momenter i avkryssningsrekkefølge og prosentreduksjon som tall', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'),
                'Mottakeren har utvist grov uaktsomhet'
            );
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Ja'));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_FOR_LEGEND, ANNET.beskrivelse));
            await user.click(
                avkryssningsboks(SÆRLIGE_GRUNNER_FOR_LEGEND, GRAD_AV_UAKTSOMHET.beskrivelse)
            );
            await user.type(
                tekstfelt(/Beskriv kort hva du legger i alternativet/),
                'Særlig belastende situasjon'
            );
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet'
                ),
                'Det foreligger særlige grunner'
            );
            await user.type(tallfelt('Hvor mange prosent skal beløpet reduseres med?'), '30');
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'grovtUaktsomt',
                            begrunnelse: 'Mottakeren har utvist grov uaktsomhet',
                            erDetSærligeGrunner: {
                                erDetSaerligeGrunner: 'ja',
                                særligeGrunnerFor: [ANNET, GRAD_AV_UAKTSOMHET],
                                prosentReduksjon: 30,
                                begrunnelse: 'Det foreligger særlige grunner',
                                annetBegrunnelse: 'Særlig belastende situasjon',
                            },
                        },
                    },
                },
            });
        });

        test('burde sende god tro med beløp i behold som tall og nøstet reduksjonsobjekt', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_GOD_TRO));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                ),
                'Mottakeren var i aktsom god tro'
            );
            await user.click(radio('Deler av beløpet'));
            await user.type(
                tekstfelt('Begrunn hvorfor deler av beløpet er i behold'),
                'Deler er brukt opp'
            );
            await user.type(tekstfelt('Hvor mange kroner er i behold?'), '2500');
            await user.click(
                radioIGruppe('Skal hele beløpet som er i behold kreves tilbake?', 'Nei')
            );
            await user.click(
                avkryssningsboks(
                    /^Hva er årsaken\(e\) til at hele beløpet som er i behold ikke skal kreves tilbake\?/,
                    TID_SIDEN_UTBETALING.beskrivelse
                )
            );
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at hele beløpet som er i behold ikke skal kreves tilbake'
                ),
                'Det har gått lang tid'
            );
            await user.type(tallfelt('Hvor mange kroner skal kreves tilbake?'), '1000');
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'deler',
                            beløp: 2500,
                            begrunnelse: 'Deler er brukt opp',
                            reduksjon: {
                                reduksjon: 'skalReduseres',
                                beløp: 1000,
                                relevans: [TID_SIDEN_UTBETALING],
                                annetBegrunnelse: null,
                                begrunnelse: 'Det har gått lang tid',
                            },
                        },
                    },
                },
            });
        });

        test('burde sende god tro uten beløp og reduksjon når ingenting av beløpet er i behold', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_GOD_TRO));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                ),
                'Mottakeren var i aktsom god tro'
            );
            await user.click(radio('Ingenting av beløpet'));
            await user.type(
                tekstfelt('Begrunn hvorfor ingenting av beløpet er i behold'),
                'Beløpet er brukt opp'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'ingenting',
                            begrunnelse: 'Beløpet er brukt opp',
                        },
                    },
                },
            });
        });

        test('burde sende begrunnelser ordrett uten å trimme mellomrom', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Forsett'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'),
                '  Mottakeren visste det  '
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                body: { valg: { aktsomhet: { begrunnelse: '  Mottakeren visste det  ' } } },
            });
        });
    });

    describe('Klientvalidering', () => {
        test('burde ikke la påkrevde felter i god tro-grenen blokkere innsending av forsettsgrenen', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_GOD_TRO));
            await user.click(lagreKnapp());
            expect(await screen.findByText('Du må gjøre et valg')).toBeInTheDocument();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Forsett'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'),
                'Mottakeren visste det'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
            });
        });

        test('burde knytte feilmeldingen for "Annet" til fritekstfeltet og ikke til skjemaet', async () => {
            renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'),
                'Grovt uaktsomt'
            );
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Ja'));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_FOR_LEGEND, ANNET.beskrivelse));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet'
                ),
                'Det foreligger særlige grunner'
            );
            await user.type(tallfelt('Hvor mange prosent skal beløpet reduseres med?'), '30');
            await user.click(lagreKnapp());

            await waitFor(() =>
                expect(
                    tekstfelt(/Beskriv kort hva du legger i alternativet/)
                ).toHaveAccessibleDescription('Du må fylle inn en verdi')
            );
            expect(screen.getAllByText('Du må fylle inn en verdi')).toHaveLength(1);
        });

        test('burde fjerne feilmeldingen når brukeren fyller ut feltet', async () => {
            renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Forsett'));
            await user.click(lagreKnapp());
            const begrunnelse = tekstfelt(
                'Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'
            );
            await waitFor(() =>
                expect(begrunnelse).toHaveAccessibleDescription(/Du må fylle inn en verdi/)
            );

            await user.type(begrunnelse, 'Mottakeren visste det');

            await waitFor(() =>
                expect(screen.queryByText('Du må fylle inn en verdi')).not.toBeInTheDocument()
            );
        });

        test('burde fjerne feilmeldingen når brukeren krysser av et moment', async () => {
            renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Ja'));
            await user.click(lagreKnapp());
            expect(await screen.findByText('Du må velge minst ett alternativ')).toBeInTheDocument();

            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_FOR_LEGEND, NAVS_FEIL.beskrivelse));

            await waitFor(() =>
                expect(
                    screen.queryByText('Du må velge minst ett alternativ')
                ).not.toBeInTheDocument()
            );
        });
    });

    describe('Fritekst for «Annet»', () => {
        test('burde ikke sende friteksten når avkryssningen for «Annet» er fjernet igjen', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'),
                'Mottakeren har utvist grov uaktsomhet'
            );
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Nei'));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_MOT_LEGEND, ANNET.beskrivelse));
            await user.type(
                tekstfelt(/Beskriv kort hva du legger i alternativet/),
                'Denne teksten skal ikke lagres'
            );
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_MOT_LEGEND, ANNET.beskrivelse));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_MOT_LEGEND, NAVS_FEIL.beskrivelse));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet'
                ),
                'Feilen kan ikke tilskrives Nav'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                body: {
                    valg: {
                        aktsomhet: {
                            erDetSærligeGrunner: {
                                særligeGrunnerMot: [NAVS_FEIL],
                                annetBegrunnelse: null,
                            },
                        },
                    },
                },
            });
        });
    });

    describe('Bytte av gren midt i utfylling', () => {
        test('burde bare sende feltene til den aktive grenen etter bytte av vilkår', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Forsett'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'),
                'Denne begrunnelsen skal ikke sendes'
            );

            await user.click(radio(VILKÅR_GOD_TRO));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                ),
                'Mottakeren var i aktsom god tro'
            );
            await user.click(radio('Ingenting av beløpet'));
            await user.type(
                tekstfelt('Begrunn hvorfor ingenting av beløpet er i behold'),
                'Beløpet er brukt opp'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toEqual({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
                body: {
                    id: PERIODE_ID,
                    fom: FOM,
                    tom: TOM,
                    delbarePerioder,
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'ingenting',
                            begrunnelse: 'Beløpet er brukt opp',
                        },
                    },
                },
            });
        });

        test('burde ikke vise feilmeldinger fra forrige gren eller la dem blokkere innsending', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(lagreKnapp());
            expect(await screen.findByText('Du må gjøre et valg')).toBeInTheDocument();

            await user.click(radio(VILKÅR_GOD_TRO));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                ),
                'Mottakeren var i aktsom god tro'
            );
            await user.click(radio('Ingenting av beløpet'));
            await user.type(
                tekstfelt('Begrunn hvorfor ingenting av beløpet er i behold'),
                'Beløpet er brukt opp'
            );

            expect(screen.queryByText('Du må gjøre et valg')).not.toBeInTheDocument();

            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
            });
        });
    });
});
