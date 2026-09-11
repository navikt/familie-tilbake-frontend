import type { UserEvent } from '@testing-library/user-event';
import type {
    BehandlingLagreVilkaarsvurderingData,
    Moment,
    PeriodeInfo,
    ReduksjonArsaker,
    Unnlatelse,
    Vilkaarsperiode,
    Vilkaarsvurdering,
    VilkaarsvurderingValg,
} from '@/generated-new';
import type { Vilkårsperiode } from '../typer';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { useGlobalAlertStore } from '@/stores/globalAlertStore';
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

const lagVilkårsvurdering = (
    valg: VilkaarsvurderingValg,
    delbare: PeriodeInfo[] = delbarePerioder
): Vilkaarsvurdering => ({
    id: PERIODE_ID,
    fom: FOM,
    tom: TOM,
    delbarePerioder: delbare,
    valg,
});

const lagValgtPeriode = (
    feilutbetaltBeløp: number,
    vurdering: Vilkårsperiode['vurdering']
): Vilkårsperiode => ({
    id: PERIODE_ID,
    fom: '01.01.2024',
    tom: '31.01.2024',
    feilutbetalt: feilutbetaltBeløp,
    vurdering,
    resultat: 'FULL_TILBAKEKREVING',
    rettsligGrunnlag: [],
});

const lagVilkårsperiode = (
    feilutbetaltBeløp: number,
    valg: VilkaarsvurderingValg,
    delbare: PeriodeInfo[] = delbarePerioder
): Vilkaarsperiode => ({
    feilutbetaltBeløp,
    delresultat: 'FULL_TILBAKEKREVING',
    fakta: { rettsligGrunnlag: [] },
    simulertBeløp: feilutbetaltBeløp,
    vilkårsvurdering: lagVilkårsvurdering(valg, delbare),
});

const FORRIGE_PERIODE_ID = 'periode-0';
const lagForrigeVilkårsperiode = (): Vilkaarsperiode => ({
    feilutbetaltBeløp: 5000,
    delresultat: 'FULL_TILBAKEKREVING',
    fakta: { rettsligGrunnlag: [] },
    simulertBeløp: 5000,
    vilkårsvurdering: {
        id: FORRIGE_PERIODE_ID,
        fom: '2023-12-01',
        tom: '2023-12-31',
        delbarePerioder: [
            {
                periodeId: FORRIGE_PERIODE_ID,
                periode: { fom: '2023-12-01', tom: '2023-12-31' },
            },
        ],
        valg: { vurdering: 'ikke_vurdert' },
    },
});

type RenderProps = {
    erUnder4xRettsgebyr?: boolean;
    feilutbetaltBeløp?: number;
    valg?: VilkaarsvurderingValg;
    vurdering?: Vilkårsperiode['vurdering'];
    behandlingILesemodus?: boolean;
    delbare?: PeriodeInfo[];
    medForrigePeriode?: boolean;
};

const renderSkjema = ({
    erUnder4xRettsgebyr = false,
    feilutbetaltBeløp = 10000,
    valg = { vurdering: 'ikke_vurdert' },
    vurdering = 'IKKE_VURDERT',
    behandlingILesemodus = false,
    delbare = delbarePerioder,
    medForrigePeriode = false,
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
            <TestBehandlingProvider
                behandling={lagBehandling({ behandlingId: BEHANDLING_ID })}
                stateOverrides={{ behandlingILesemodus }}
            >
                <VilkårsvurderingLesedataProvider
                    momenterSærligeGrunner={momenterSærligeGrunner}
                    momenterReduksjonGodTro={momenterReduksjonGodTro}
                    erUnder4xRettsgebyr={erUnder4xRettsgebyr}
                >
                    <VilkårsvurderingDetaljer
                        valgtPeriode={lagValgtPeriode(feilutbetaltBeløp, vurdering)}
                        vilkårsperioder={[
                            ...(medForrigePeriode ? [lagForrigeVilkårsperiode()] : []),
                            lagVilkårsperiode(feilutbetaltBeløp, valg, delbare),
                        ]}
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

const medLedetekst =
    (ledetekst: string) =>
    (tilgjengeligNavn: string): boolean =>
        tilgjengeligNavn.includes(ledetekst);

const radiogruppe = (ledetekst: string): HTMLElement =>
    screen.getByRole('radiogroup', { name: medLedetekst(ledetekst) });

const avkryssningsgruppe = (ledetekst: string): HTMLElement =>
    screen.getByRole('group', { name: medLedetekst(ledetekst) });

const radioIGruppe = (ledetekst: string, navn: string): HTMLElement =>
    within(radiogruppe(ledetekst)).getByRole('radio', { name: navn });

const avkryssningsboks = (ledetekst: string, navn: string): HTMLElement =>
    within(avkryssningsgruppe(ledetekst)).getByRole('checkbox', { name: navn });

const erSkrivebeskyttet = (gruppe: HTMLElement): boolean =>
    within(gruppe).queryAllByTitle('Skrivebeskyttet').length > 0;

const tekstfelt = (navn: string | RegExp): HTMLElement =>
    screen.getByRole('textbox', { name: navn });

const tallfelt = (navn: string | RegExp): HTMLElement =>
    screen.getByRole('spinbutton', { name: navn });

const VILKÅR_FORSTO_ELLER_BURDE_FORSTÅTT = /forsto eller burde forstått/;
const VILKÅR_FORÅRSAKET_AV_MOTTAKER = /forsettlig eller uaktsomt gi feilaktige/;
const VILKÅR_GOD_TRO = /aktsom god tro/;

const ANNET_LABEL = 'Beskriv kort hva du legger i alternativet “Annet”';
const SÆRLIGE_GRUNNER_LEGEND = 'Er det særlige grunner til å redusere beløpet?';
const SÆRLIGE_GRUNNER_FOR_LEGEND = 'Hvilke særlige grunner taler for å redusere beløpet?';
const SÆRLIGE_GRUNNER_MOT_LEGEND = 'Hvilke særlige grunner taler mot å redusere beløpet?';
const REDUKSJON_LEGEND = 'Skal beløpet reduseres?';
const REDUKSJON_JA_LEGEND = 'Hva er årsaken(e) til at beløpet skal reduseres?';
const REDUKSJON_NEI_LEGEND = 'Hva er årsaken(e) til at beløpet ikke skal reduseres?';
const UNNLATELSE_LEGEND = 'Skal beløpet kreves tilbake? (sjette avsnitt)';
const PROSENT_LABEL = 'Hvor mange prosent skal beløpet reduseres med?';
const VILKÅR_LEGEND = 'Hvilket vilkår etter folketrygdloven § 22-15 gjelder for perioden?';
const FORSTÅELSE_LEGEND = 'Vurder mottakerens forståelse på utbetalingstidspunktet';
const AKTSOMHET_LEGEND = 'Vurder mottakerens uaktsomhet i perioden';
const BELØP_I_BEHOLD_LEGEND = 'Hvor mye av det feilutbetalte beløpet er i behold?';

const jaSærligeGrunner: ReduksjonArsaker = {
    erDetReduksjonÅrsaker: 'ja',
    særligeGrunnerFor: [GRAD_AV_UAKTSOMHET, ANNET],
    prosentReduksjon: 30,
    begrunnelse: 'Det er særlige grunner til å redusere',
    annetBegrunnelse: 'Annet for reduksjon',
};

const neiSærligeGrunner: ReduksjonArsaker = {
    erDetReduksjonÅrsaker: 'nei',
    særligeGrunnerMot: [NAVS_FEIL, ANNET],
    begrunnelse: 'Det er ikke særlige grunner til å redusere',
    annetBegrunnelse: 'Annet mot reduksjon',
};

const jaGodTroReduksjon: ReduksjonArsaker = {
    erDetReduksjonÅrsaker: 'jaGodTro',
    prosentReduksjon: 40,
    relevans: [STØRRELSE_PÅ_BELØPET, ANNET],
    begrunnelse: 'Beløpet skal reduseres',
    annetBegrunnelse: 'Annet for god tro-reduksjon',
};

const neiGodTroReduksjon: ReduksjonArsaker = {
    erDetReduksjonÅrsaker: 'neiGodTro',
    relevans: [TID_SIDEN_UTBETALING, ANNET],
    begrunnelse: 'Beløpet skal ikke reduseres',
    annetBegrunnelse: 'Annet mot god tro-reduksjon',
};

const forstoEllerBurdeForstått = (
    forståelse: 'forsto' | 'burdeForstått',
    unnlatelse: ReduksjonArsaker | 'skalUnnlates' | 'skalIkkeUnnlates'
): VilkaarsvurderingValg => {
    const utledUnnlatelse = (): Unnlatelse => {
        if (unnlatelse === 'skalUnnlates') {
            return { unnlatelse: 'skalUnnlates', begrunnelse: 'Beløpet er lavt' };
        }
        if (unnlatelse === 'skalIkkeUnnlates') {
            return {
                unnlatelse: 'skalIkkeUnnlates',
                begrunnelse: 'Tilbakekrevingen skal ikke unnlates',
                erDetSærligeGrunner: jaSærligeGrunner,
            };
        }
        return { unnlatelse: 'ikkeAktuelt', erDetSærligeGrunner: unnlatelse };
    };

    return {
        vurdering: 'forsto_eller_burde_forstått',
        forståelse:
            forståelse === 'forsto'
                ? {
                      forståelse: 'forsto',
                      begrunnelse: 'Mottakeren forsto at utbetalingen var feil',
                      unnlatelse: utledUnnlatelse(),
                  }
                : {
                      forståelse: 'burdeForstått',
                      begrunnelse: 'Mottakeren burde forstått at utbetalingen var feil',
                      unnlatelse: utledUnnlatelse(),
                  },
    };
};

describe('VilkårsvurderingSkjema', () => {
    let user: UserEvent;

    beforeAll(() => {
        user = userEvent.setup({ delay: null });
    });

    beforeEach(() => {
        useGlobalAlertStore.setState({ alerts: [] });
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
                                    erDetReduksjonÅrsaker: 'nei',
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
            await user.click(radioIGruppe('Skal beløpet kreves tilbake? (sjette avsnitt)', 'Nei'));
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
                                erDetReduksjonÅrsaker: 'ja',
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
                tekstfelt('Begrunn hvorfor deler av det feilutbetalte beløpet er i behold'),
                'Deler er brukt opp'
            );
            await user.type(tallfelt('Hvor mange kroner er i behold?'), '2500');
            await user.click(radioIGruppe('Skal beløpet reduseres?', 'Ja'));
            await user.click(
                avkryssningsboks(REDUKSJON_JA_LEGEND, TID_SIDEN_UTBETALING.beskrivelse)
            );
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at beløpet skal reduseres'),
                'Det har gått lang tid'
            );
            await user.type(tallfelt('Hvor mange prosent skal beløpet reduseres med?'), '40');
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
                                erDetReduksjonÅrsaker: 'jaGodTro',
                                prosentReduksjon: 40,
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
                tekstfelt('Begrunn hvorfor ingenting av det feilutbetalte beløpet er i behold'),
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

    describe('Prosentreduksjon', () => {
        const fyllUtGrovtUaktsomMedSærligeGrunner = async (
            user: UserEvent,
            prosent: string
        ): Promise<void> => {
            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'),
                'Mottakeren har utvist grov uaktsomhet'
            );
            await user.click(radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Ja'));
            await user.click(avkryssningsboks(SÆRLIGE_GRUNNER_FOR_LEGEND, NAVS_FEIL.beskrivelse));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet'
                ),
                'Det foreligger særlige grunner'
            );
            await user.type(tallfelt('Hvor mange prosent skal beløpet reduseres med?'), prosent);
            await user.click(lagreKnapp());
        };

        test.each<[string, string]>([
            ['over 100', '150'],
            ['negativ', '-5'],
            ['ikke et helt tall', '50.5'],
        ])('burde blokkere innsending når prosenten er %s', async (_beskrivelse, prosent) => {
            renderSkjema();

            await fyllUtGrovtUaktsomMedSærligeGrunner(user, prosent);

            await waitFor(() =>
                expect(
                    tallfelt('Hvor mange prosent skal beløpet reduseres med?')
                ).toHaveAccessibleDescription('Du må fylle inn et helt tall mellom 0 og 100')
            );
        });

        test.each<[string, number]>([
            ['0', 0],
            ['100', 100],
        ])('burde godta grenseverdien %s prosent', async (prosent, forventet) => {
            const sendtRequest = renderSkjema();

            await fyllUtGrovtUaktsomMedSærligeGrunner(user, prosent);

            await expect(sendtRequest).resolves.toMatchObject({
                body: {
                    valg: {
                        aktsomhet: { erDetSærligeGrunner: { prosentReduksjon: forventet } },
                    },
                },
            });
        });
    });

    describe('Beløpsgrenser', () => {
        const REDUKSJON_LEGEND = 'Skal beløpet reduseres?';
        const REDUKSJON_BEGRUNNELSE = 'Begrunn hvorfor du vurderer at beløpet skal reduseres';

        const fyllUtGodTroDeler = async (
            user: UserEvent,
            beløpIBehold: string,
            prosentReduksjon?: string
        ): Promise<void> => {
            await user.click(radio(VILKÅR_GOD_TRO));
            await user.type(
                tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                ),
                'Mottakeren var i aktsom god tro'
            );
            await user.click(radio('Deler av beløpet'));
            await user.type(
                tekstfelt('Begrunn hvorfor deler av det feilutbetalte beløpet er i behold'),
                'Deler er brukt opp'
            );
            await user.type(tallfelt('Hvor mange kroner er i behold?'), beløpIBehold);
            if (prosentReduksjon === undefined) {
                await user.click(radioIGruppe(REDUKSJON_LEGEND, 'Nei'));
                await user.click(
                    avkryssningsboks(REDUKSJON_NEI_LEGEND, TID_SIDEN_UTBETALING.beskrivelse)
                );
                await user.type(
                    tekstfelt('Begrunn hvorfor du vurderer at beløpet ikke skal reduseres'),
                    'Det har gått lang tid'
                );
            } else {
                await user.click(radioIGruppe(REDUKSJON_LEGEND, 'Ja'));
                await user.click(
                    avkryssningsboks(REDUKSJON_JA_LEGEND, TID_SIDEN_UTBETALING.beskrivelse)
                );
                await user.type(tekstfelt(REDUKSJON_BEGRUNNELSE), 'Det har gått lang tid');
                await user.type(
                    tallfelt('Hvor mange prosent skal beløpet reduseres med?'),
                    prosentReduksjon
                );
            }
            await user.click(lagreKnapp());
        };

        test('burde blokkere innsending når beløpet i behold er høyere enn det feilutbetalte beløpet', async () => {
            renderSkjema({ feilutbetaltBeløp: 5000 });

            await fyllUtGodTroDeler(user, '5001');

            await waitFor(() =>
                expect(tallfelt('Hvor mange kroner er i behold?')).toHaveAccessibleDescription(
                    /Beløpet kan ikke være høyere enn det feilutbetalte beløpet på 5\s000 kroner/
                )
            );
        });

        test.each<[string, string]>([
            ['er høyere enn 100', '101'],
            ['er negativ', '-1'],
            ['ikke er et helt tall', '12.5'],
        ])(
            'burde blokkere innsending når reduksjonsprosenten %s',
            async (_beskrivelse, prosent) => {
                renderSkjema({ feilutbetaltBeløp: 5000 });

                await fyllUtGodTroDeler(user, '2000', prosent);

                await waitFor(() =>
                    expect(
                        tallfelt('Hvor mange prosent skal beløpet reduseres med?')
                    ).toHaveAccessibleDescription('Du må fylle inn et helt tall mellom 0 og 100')
                );
            }
        );

        test('burde knytte feilmeldingen til prosentfeltet og ikke til beløpet i behold', async () => {
            renderSkjema({ feilutbetaltBeløp: 5000 });

            await fyllUtGodTroDeler(user, '2000', '101');

            await waitFor(() =>
                expect(
                    screen.getByText('Du må fylle inn et helt tall mellom 0 og 100')
                ).toBeInTheDocument()
            );
            expect(tallfelt('Hvor mange kroner er i behold?')).toHaveAccessibleDescription('');
        });

        test.each<[string, string]>([
            ['er null', '0'],
            ['er negativt', '-100'],
            ['ikke er et helt kronebeløp', '1500.5'],
        ])('burde blokkere innsending når beløpet i behold %s', async (_beskrivelse, beløp) => {
            renderSkjema({ feilutbetaltBeløp: 5000 });

            await fyllUtGodTroDeler(user, beløp);

            await waitFor(() =>
                expect(tallfelt('Hvor mange kroner er i behold?')).toHaveAccessibleDescription(
                    'Du må fylle inn et helt beløp i kroner høyere enn 0'
                )
            );
        });
    });

    describe('Lagre-knappen', () => {
        const forsettlig: VilkaarsvurderingValg = {
            vurdering: 'forårsaket_av_mottaker',
            aktsomhet: {
                aktsomhet: 'forsettlig',
                begrunnelse: 'Mottakeren visste at utbetalingen var feil',
            },
        };

        test('burde varsle i stedet for å lagre når ingenting er endret', async () => {
            const sendtRequest = renderSkjema({ valg: forsettlig, vurdering: 'FORSETT' });
            let harSendtRequest = false;
            sendtRequest.then(() => {
                harSendtRequest = true;
            });

            await user.click(lagreKnapp());

            await waitFor(() =>
                expect(useGlobalAlertStore.getState().alerts).toMatchObject([
                    { title: 'Ingen endringer å lagre', status: 'announcement' },
                ])
            );
            expect(harSendtRequest).toBe(false);
        });

        test('burde lagre når skjemaet er endret etter at det ble lagret', async () => {
            const sendtRequest = renderSkjema({ valg: forsettlig, vurdering: 'FORSETT' });

            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'),
                ' og handlet likevel'
            );
            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                body: {
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'forsettlig',
                            begrunnelse:
                                'Mottakeren visste at utbetalingen var feil og handlet likevel',
                        },
                    },
                },
            });
        });

        test('burde flytte fokus til det første feltet med feil ved mislykket innsending', async () => {
            renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(lagreKnapp());

            await waitFor(() => expect(radio('Uaktsom')).toHaveFocus());
        });

        test('burde regne perioden som lagret og vurdert etter en vellykket lagring', async () => {
            const sendtRequest = renderSkjema();

            await user.click(radio(VILKÅR_FORÅRSAKET_AV_MOTTAKER));
            await user.click(radio('Grovt uaktsom'));
            await user.type(
                tekstfelt('Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'),
                'Mottakeren har handlet grovt uaktsomt'
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
            await sendtRequest;

            expect(await screen.findByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();

            await user.click(lagreKnapp());

            await waitFor(() =>
                expect(useGlobalAlertStore.getState().alerts).toMatchObject([
                    { title: 'Ingen endringer å lagre', status: 'announcement' },
                ])
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
                tekstfelt('Begrunn hvorfor ingenting av det feilutbetalte beløpet er i behold'),
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
                tekstfelt('Begrunn hvorfor ingenting av det feilutbetalte beløpet er i behold'),
                'Beløpet er brukt opp'
            );

            expect(screen.queryByText('Du må gjøre et valg')).not.toBeInTheDocument();

            await user.click(lagreKnapp());

            await expect(sendtRequest).resolves.toMatchObject({
                path: { behandlingId: BEHANDLING_ID, periodeId: PERIODE_ID },
            });
        });
    });

    describe('Lesemodus', () => {
        const renderLesemodus = (props: RenderProps = {}): void => {
            renderSkjema({ behandlingILesemodus: true, ...props });
        };

        describe('VilkårsvurderingSkjema', () => {
            test('burde ikke la saksbehandleren bytte vilkår', async () => {
                renderLesemodus({ valg: forstoEllerBurdeForstått('forsto', neiSærligeGrunner) });

                const valgtVilkår = radio(/forsto eller burde forstått/);
                const annetVilkår = radio(/aktsom god tro/);
                expect(erSkrivebeskyttet(radiogruppe(VILKÅR_LEGEND))).toBe(true);
                expect(valgtVilkår).toBeChecked();

                await user.click(annetVilkår);

                expect(annetVilkår).not.toBeChecked();
                expect(valgtVilkår).toBeChecked();
            });
        });

        describe('ForstoEllerBurdeForståttFelter', () => {
            test('burde ikke la saksbehandleren endre mottakerens forståelse', async () => {
                renderLesemodus({ valg: forstoEllerBurdeForstått('forsto', neiSærligeGrunner) });

                const forsto = radio('Mottakeren forsto at utbetalingen skyldtes en feil');
                const burdeForstått = radio(
                    'Mottakeren burde forstått at utbetalingen skyldtes en feil'
                );
                expect(erSkrivebeskyttet(radiogruppe(FORSTÅELSE_LEGEND))).toBe(true);
                expect(forsto).toBeChecked();

                await user.click(burdeForstått);

                expect(burdeForstått).not.toBeChecked();
                expect(forsto).toBeChecked();
            });
        });

        describe('Forsto', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({ valg: forstoEllerBurdeForstått('forsto', neiSærligeGrunner) });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren forsto at utbetalingen skyldtes en feil'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'ny tekst');

                expect(begrunnelse).toHaveValue('Mottakeren forsto at utbetalingen var feil');
            });
        });

        describe('BurdeForstått', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: forstoEllerBurdeForstått('burdeForstått', neiSærligeGrunner),
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren burde forstått at utbetalingen skyldtes en feil'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'ny tekst');

                expect(begrunnelse).toHaveValue(
                    'Mottakeren burde forstått at utbetalingen var feil'
                );
            });
        });

        describe('SærligeGrunner', () => {
            test('burde skrivebeskytte hele ja-grenen', async () => {
                renderLesemodus({ valg: forstoEllerBurdeForstått('forsto', jaSærligeGrunner) });

                const jaValg = radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Ja');
                const neiValg = radioIGruppe(SÆRLIGE_GRUNNER_LEGEND, 'Nei');
                const valgtMoment = avkryssningsboks(
                    SÆRLIGE_GRUNNER_FOR_LEGEND,
                    GRAD_AV_UAKTSOMHET.beskrivelse
                );
                const ikkeValgtMoment = avkryssningsboks(
                    SÆRLIGE_GRUNNER_FOR_LEGEND,
                    NAVS_FEIL.beskrivelse
                );
                const annetBegrunnelse = tekstfelt(ANNET_LABEL);
                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet'
                );
                const prosent = tallfelt(PROSENT_LABEL);

                expect(jaValg).toBeChecked();
                expect(erSkrivebeskyttet(radiogruppe(SÆRLIGE_GRUNNER_LEGEND))).toBe(true);
                expect(erSkrivebeskyttet(avkryssningsgruppe(SÆRLIGE_GRUNNER_FOR_LEGEND))).toBe(
                    true
                );
                expect(annetBegrunnelse).toHaveAttribute('readonly');
                expect(begrunnelse).toHaveAttribute('readonly');
                expect(prosent).toHaveAttribute('readonly');

                await user.click(neiValg);
                await user.click(ikkeValgtMoment);
                await user.click(valgtMoment);
                await user.type(annetBegrunnelse, 'endret');
                await user.type(begrunnelse, 'endret');
                await user.type(prosent, '5');

                expect(jaValg).toBeChecked();
                expect(neiValg).not.toBeChecked();
                expect(valgtMoment).toBeChecked();
                expect(ikkeValgtMoment).not.toBeChecked();
                expect(annetBegrunnelse).toHaveValue('Annet for reduksjon');
                expect(begrunnelse).toHaveValue('Det er særlige grunner til å redusere');
                expect(prosent).toHaveValue(30);
            });

            test('burde skrivebeskytte hele nei-grenen', async () => {
                renderLesemodus({ valg: forstoEllerBurdeForstått('forsto', neiSærligeGrunner) });

                const valgtMoment = avkryssningsboks(
                    SÆRLIGE_GRUNNER_MOT_LEGEND,
                    NAVS_FEIL.beskrivelse
                );
                const annetBegrunnelse = tekstfelt(ANNET_LABEL);
                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet'
                );

                expect(erSkrivebeskyttet(avkryssningsgruppe(SÆRLIGE_GRUNNER_MOT_LEGEND))).toBe(
                    true
                );
                expect(annetBegrunnelse).toHaveAttribute('readonly');
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.click(valgtMoment);
                await user.type(annetBegrunnelse, 'endret');
                await user.type(begrunnelse, 'endret');

                expect(valgtMoment).toBeChecked();
                expect(annetBegrunnelse).toHaveValue('Annet mot reduksjon');
                expect(begrunnelse).toHaveValue('Det er ikke særlige grunner til å redusere');
            });
        });

        describe('Under4xRettsgebyr', () => {
            test('burde skrivebeskytte unnlatelsesvalget og begrunnelsen når beløpet ikke skal unnlates', async () => {
                renderLesemodus({
                    valg: forstoEllerBurdeForstått('forsto', 'skalIkkeUnnlates'),
                    erUnder4xRettsgebyr: true,
                });

                const jaValg = radioIGruppe(UNNLATELSE_LEGEND, 'Ja');
                const neiValg = radioIGruppe(UNNLATELSE_LEGEND, 'Nei');
                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at tilbakekrevingen ikke skal unnlates'
                );

                expect(jaValg).toBeChecked();
                expect(erSkrivebeskyttet(radiogruppe(UNNLATELSE_LEGEND))).toBe(true);
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.click(neiValg);
                await user.type(begrunnelse, 'endret');

                expect(jaValg).toBeChecked();
                expect(neiValg).not.toBeChecked();
                expect(begrunnelse).toHaveValue('Tilbakekrevingen skal ikke unnlates');
            });

            test('burde skrivebeskytte begrunnelsen når beløpet skal unnlates', async () => {
                renderLesemodus({
                    valg: forstoEllerBurdeForstått('forsto', 'skalUnnlates'),
                    erUnder4xRettsgebyr: true,
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at Nav skal la være å kreve beløpet tilbake'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Beløpet er lavt');
            });
        });

        describe('ForårsaketAvMottakerenFelter', () => {
            test('burde ikke la saksbehandleren endre aktsomhetsgraden', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'forsettlig',
                            begrunnelse: 'Mottakeren handlet med forsett',
                        },
                    },
                });

                const forsett = radio('Forsett');
                const uaktsom = radio('Uaktsom');
                expect(erSkrivebeskyttet(radiogruppe(AKTSOMHET_LEGEND))).toBe(true);
                expect(forsett).toBeChecked();

                await user.click(uaktsom);

                expect(uaktsom).not.toBeChecked();
                expect(forsett).toBeChecked();
            });
        });

        describe('Forsett', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'forsettlig',
                            begrunnelse: 'Mottakeren handlet med forsett',
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har handlet med forsett'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Mottakeren handlet med forsett');
            });
        });

        describe('GrovtUaktsom', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'grovtUaktsomt',
                            begrunnelse: 'Mottakeren handlet grovt uaktsomt',
                            erDetSærligeGrunner: neiSærligeGrunner,
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Mottakeren handlet grovt uaktsomt');
            });
        });

        describe('Uaktsom', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'uaktsomt',
                            begrunnelse: 'Mottakeren handlet uaktsomt',
                            unnlatelse: {
                                unnlatelse: 'ikkeAktuelt',
                                erDetSærligeGrunner: neiSærligeGrunner,
                            },
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har handlet uaktsomt'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Mottakeren handlet uaktsomt');
            });
        });

        describe('GodTroFelter', () => {
            test('burde skrivebeskytte begrunnelsen og valget av beløp i behold', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'ingenting',
                            begrunnelse: 'Beløpet er brukt opp',
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro'
                );
                const ingenting = radio('Ingenting av beløpet');
                const hele = radio('Hele beløpet');

                expect(begrunnelse).toHaveAttribute('readonly');
                expect(erSkrivebeskyttet(radiogruppe(BELØP_I_BEHOLD_LEGEND))).toBe(true);
                expect(ingenting).toBeChecked();

                await user.type(begrunnelse, 'endret');
                await user.click(hele);

                expect(begrunnelse).toHaveValue('Mottakeren var i aktsom god tro');
                expect(hele).not.toBeChecked();
                expect(ingenting).toBeChecked();
            });
        });

        describe('Ingenting', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'ingenting',
                            begrunnelse: 'Beløpet er brukt opp',
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor ingenting av det feilutbetalte beløpet er i behold'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Beløpet er brukt opp');
            });
        });

        describe('Hele', () => {
            test('burde vise begrunnelsen skrivebeskyttet', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'hele',
                            begrunnelse: 'Hele beløpet er i behold',
                            reduksjon: neiGodTroReduksjon,
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor hele det feilutbetalte beløpet er i behold'
                );
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');

                expect(begrunnelse).toHaveValue('Hele beløpet er i behold');
            });
        });

        describe('Deler', () => {
            test('burde skrivebeskytte både begrunnelsen og beløpet i behold', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'deler',
                            beløp: 2500,
                            begrunnelse: 'Deler av beløpet er i behold',
                            reduksjon: neiGodTroReduksjon,
                        },
                    },
                });

                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor deler av det feilutbetalte beløpet er i behold'
                );
                const beløp = tallfelt('Hvor mange kroner er i behold?');

                expect(begrunnelse).toHaveAttribute('readonly');
                expect(beløp).toHaveAttribute('readonly');

                await user.type(begrunnelse, 'endret');
                await user.type(beløp, '7');

                expect(begrunnelse).toHaveValue('Deler av beløpet er i behold');
                expect(beløp).toHaveValue(2500);
            });
        });

        describe('Reduksjon', () => {
            test('burde skrivebeskytte hele ja-grenen', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'hele',
                            begrunnelse: 'Hele beløpet er i behold',
                            reduksjon: jaGodTroReduksjon,
                        },
                    },
                });

                const jaValg = radioIGruppe(REDUKSJON_LEGEND, 'Ja');
                const neiValg = radioIGruppe(REDUKSJON_LEGEND, 'Nei');
                const valgtMoment = avkryssningsboks(
                    REDUKSJON_JA_LEGEND,
                    STØRRELSE_PÅ_BELØPET.beskrivelse
                );
                const ikkeValgtMoment = avkryssningsboks(
                    REDUKSJON_JA_LEGEND,
                    TID_SIDEN_UTBETALING.beskrivelse
                );
                const annetBegrunnelse = tekstfelt(ANNET_LABEL);
                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at beløpet skal reduseres'
                );
                const prosent = tallfelt(PROSENT_LABEL);

                expect(jaValg).toBeChecked();
                expect(erSkrivebeskyttet(radiogruppe(REDUKSJON_LEGEND))).toBe(true);
                expect(erSkrivebeskyttet(avkryssningsgruppe(REDUKSJON_JA_LEGEND))).toBe(true);
                expect(annetBegrunnelse).toHaveAttribute('readonly');
                expect(begrunnelse).toHaveAttribute('readonly');
                expect(prosent).toHaveAttribute('readonly');

                await user.click(neiValg);
                await user.click(valgtMoment);
                await user.click(ikkeValgtMoment);
                await user.type(annetBegrunnelse, 'endret');
                await user.type(begrunnelse, 'endret');
                await user.type(prosent, '5');

                expect(jaValg).toBeChecked();
                expect(neiValg).not.toBeChecked();
                expect(valgtMoment).toBeChecked();
                expect(ikkeValgtMoment).not.toBeChecked();
                expect(annetBegrunnelse).toHaveValue('Annet for god tro-reduksjon');
                expect(begrunnelse).toHaveValue('Beløpet skal reduseres');
                expect(prosent).toHaveValue(40);
            });

            test('burde skrivebeskytte hele nei-grenen', async () => {
                renderLesemodus({
                    valg: {
                        vurdering: 'god_tro',
                        begrunnelse: 'Mottakeren var i aktsom god tro',
                        beløpIBehold: {
                            belopIBehold: 'hele',
                            begrunnelse: 'Hele beløpet er i behold',
                            reduksjon: neiGodTroReduksjon,
                        },
                    },
                });

                const valgtMoment = avkryssningsboks(
                    REDUKSJON_NEI_LEGEND,
                    TID_SIDEN_UTBETALING.beskrivelse
                );
                const annetBegrunnelse = tekstfelt(ANNET_LABEL);
                const begrunnelse = tekstfelt(
                    'Begrunn hvorfor du vurderer at beløpet ikke skal reduseres'
                );

                expect(erSkrivebeskyttet(avkryssningsgruppe(REDUKSJON_NEI_LEGEND))).toBe(true);
                expect(annetBegrunnelse).toHaveAttribute('readonly');
                expect(begrunnelse).toHaveAttribute('readonly');

                await user.click(valgtMoment);
                await user.type(annetBegrunnelse, 'endret');
                await user.type(begrunnelse, 'endret');

                expect(valgtMoment).toBeChecked();
                expect(annetBegrunnelse).toHaveValue('Annet mot god tro-reduksjon');
                expect(begrunnelse).toHaveValue('Beløpet skal ikke reduseres');
            });
        });

        describe('Handlinger', () => {
            const periodehandlinger = {
                valg: forstoEllerBurdeForstått('forsto', neiSærligeGrunner),
                delbare: [
                    { periodeId: PERIODE_ID, periode: { fom: FOM, tom: '2024-01-15' } },
                    { periodeId: PERIODE_ID, periode: { fom: '2024-01-16', tom: TOM } },
                ] satisfies PeriodeInfo[],
                medForrigePeriode: true,
            };

            test('burde skjule lagring og periodehandlinger i lesemodus', () => {
                renderLesemodus(periodehandlinger);

                expect(screen.queryByRole('button', { name: 'Lagre' })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: 'Del opp' })).not.toBeInTheDocument();
                expect(
                    screen.queryByRole('button', { name: 'Slå sammen' })
                ).not.toBeInTheDocument();
            });

            test('burde vise lagring og periodehandlinger når behandlingen kan endres', () => {
                renderLesemodus({ ...periodehandlinger, behandlingILesemodus: false });

                expect(screen.getByRole('button', { name: 'Lagre' })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: 'Del opp' })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: 'Slå sammen' })).toBeInTheDocument();
            });
        });
    });
});
