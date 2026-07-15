import type {
    Moment,
    Reduksjon,
    SaerligeGrunner,
    Vilkaarsperiode,
    Vilkaarsvurdering,
} from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { VilkårsvurderingDetaljer } from './VilkårsvurderingDetaljer';
import { VilkårsvurderingLesedataProvider } from './VilkårsvurderingLesedataContext';

type Beløpsbeskrivelse = 'hele beløpet' | 'hele beløpet som er i behold';
type SærligeGrunnerRetning = 'for' | 'mot';
type Uaktsomhetsgrad = 'med forsett' | 'grovt uaktsomt' | 'uaktsomt';

const valgtPeriode: Vilkårsperiode = {
    id: '1',
    fom: '01.01.2023',
    tom: '31.12.2023',
    feilutbetalt: 10000,
    vurdering: 'IKKE_VURDERT',
    resultat: null,
    rettsligGrunnlag: [],
};

const lagVilkårsperiode = (simulertBeløp: number | null): Vilkaarsperiode => ({
    feilutbetaltBeløp: 10000,
    delresultat: null,
    fakta: { rettsligGrunnlag: [] },
    simulertBeløp,
    vilkårsvurdering: {
        id: valgtPeriode.id,
        periode: { fom: '2023-01-01', tom: '2023-12-31' },
        delbarePerioder: [],
        valg: { vurdering: 'ikke_vurdert' },
    },
});

const momenterSærligeGrunner: Moment[] = [
    {
        moment: 'GRAD_AV_UAKTSOMHET',
        beskrivelse: 'Graden av uaktsomhet hos den som kravet retter seg mot',
    },
    {
        moment: 'HELT_ELLER_DELVIS_NAVS_FEIL',
        beskrivelse: 'Om feilen helt eller delvis kan tilskrives Nav',
    },
    {
        moment: 'STØRRELSE_BELØP',
        beskrivelse: 'Størrelsen på feilutbetalt beløp',
    },
    {
        moment: 'TID_FRA_UTBETALING',
        beskrivelse: 'Hvor lang tid det har gått siden utbetalingen fant sted',
    },
    {
        moment: 'ANNET',
        beskrivelse: 'Annet',
    },
];
const momenterReduksjonGodTro: Moment[] = [
    {
        moment: 'STØRRELSE_BELØP',
        beskrivelse: 'Størrelsen på beløpet',
    },
    {
        moment: 'TID_FRA_UTBETALING',
        beskrivelse: 'Hvor lenge siden feilutbetalingen skjedde',
    },
    {
        moment: 'MOTTAKER_TILLIT',
        beskrivelse: 'Om mottakeren har innrettet seg i tillit til utbetalingen',
    },
    {
        moment: 'ANNET',
        beskrivelse: 'Annet',
    },
];

const renderVilkårsDetaljer = (
    simulertBeløp: number | null = 10000,
    erUnder4xRettsgebyr = false
): void => {
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <TestBehandlingProvider>
                <VilkårsvurderingLesedataProvider
                    momenterSærligeGrunner={momenterSærligeGrunner}
                    momenterReduksjonGodTro={momenterReduksjonGodTro}
                    erUnder4xRettsgebyr={erUnder4xRettsgebyr}
                >
                    <VilkårsvurderingDetaljer
                        valgtPeriode={valgtPeriode}
                        vilkårsperioder={[lagVilkårsperiode(simulertBeløp)]}
                        hentVilkårsvurdering={(): void => undefined}
                    />
                </VilkårsvurderingLesedataProvider>
            </TestBehandlingProvider>
        </QueryClientProvider>
    );
};

const begrunnelseGodTro = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro',
    });
const begrunnelseForårsaketAvMottakeren = async (grad: Uaktsomhetsgrad): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at mottakeren har handlet ${grad}`,
    });
const begrunnelseForstoEllerBurdeForstått = async (
    grad: 'forsto' | 'burde forstått'
): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at mottakeren ${grad} at utbetalingen skyldtes en feil`,
    });

const begrunnelseIngenting = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor ingenting av beløpet er i behold',
    });

const vilkårRadioGroup = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Hvilket vilkår etter folketrygdloven § 22-15 gjelder for perioden?',
    });
const godTroRadio = (): HTMLElement =>
    within(vilkårRadioGroup()).getByRole('radio', {
        name: 'Mottakeren har mottatt beløpet i aktsom god tro',
    });
const forårsaketAvMottakerRadio = (): HTMLElement =>
    within(vilkårRadioGroup()).getByRole('radio', {
        name: /Mottakeren har forårsaket utbetalingen ved å forsettlig eller uaktsomt gi feilaktige eller mangelfulle opplysninger \(første avsnitt andre setning\)/i,
    });
const forstoEllerBurdeForståttRadio = (): HTMLElement =>
    within(vilkårRadioGroup()).getByRole('radio', {
        name: /Mottakeren forsto eller burde forstått at utbetalingen skyldtes en feil \(første avsnitt første setning\)/i,
    });

const forståelseRadioGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: 'Vurder mottakerens forståelse på utbetalingstidspunktet',
    });
const forstoRadio = async (): Promise<HTMLElement> =>
    within(await forståelseRadioGroup()).getByRole('radio', {
        name: 'Mottakeren forsto at utbetalingen skyldtes en feil',
    });
const burdeForståttRadio = async (): Promise<HTMLElement> =>
    within(await forståelseRadioGroup()).getByRole('radio', {
        name: 'Mottakeren burde forstått at utbetalingen skyldtes en feil',
    });

const aktsomhetRadioGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: 'Vurder mottakerens uaktsomhet i perioden',
    });
const forsettRadio = async (): Promise<HTMLElement> =>
    within(await aktsomhetRadioGroup()).getByRole('radio', {
        name: 'Forsett',
    });
const grovtUaktsomRadio = async (): Promise<HTMLElement> =>
    within(await aktsomhetRadioGroup()).getByRole('radio', {
        name: 'Grovt uaktsom',
    });
const uaktsomRadio = async (): Promise<HTMLElement> =>
    within(await aktsomhetRadioGroup()).getByRole('radio', {
        name: 'Uaktsom',
    });

const særligeGrunnerRadioGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: 'Er det særlige grunner til å redusere beløpet?',
    });
const særligeGrunnerJaRadio = async (): Promise<HTMLElement> =>
    within(await særligeGrunnerRadioGroup()).getByRole('radio', { name: 'Ja' });
const særligeGrunnerNeiRadio = async (): Promise<HTMLElement> =>
    within(await særligeGrunnerRadioGroup()).getByRole('radio', { name: 'Nei' });
const særligeGrunnerCheckboxGroup = async (retning: SærligeGrunnerRetning): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: `Hvilke særlige grunner taler ${retning} å redusere beløpet?`,
    });
const begrunnelseSærligeGrunner = async (retning: SærligeGrunnerRetning): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at det ${
            retning === 'for' ? 'er' : 'ikke er'
        } særlige grunner til å redusere beløpet`,
    });
const reduksjonsprosentField = async (): Promise<HTMLElement> =>
    await screen.findByRole('spinbutton', {
        name: 'Hvor mange prosent skal beløpet reduseres med?',
    });

const under4xRadioGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: 'Skal Nav la være å kreve beløpet tilbake? (Sjette avsnitt)',
    });
const under4xJaRadio = async (): Promise<HTMLElement> =>
    within(await under4xRadioGroup()).getByRole('radio', { name: 'Ja' });
const under4xNeiRadio = async (): Promise<HTMLElement> =>
    within(await under4xRadioGroup()).getByRole('radio', { name: 'Nei' });
const begrunnelseSkalUnnlates = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at Nav skal la være å kreve beløpet tilbake',
    });
const begrunnelseSkalIkkeUnnlates = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at tilbakekrevingen ikke skal unnlates',
    });

const beløpIBeholdRadioGroup = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Hvor mye av det feilutbetalte beløpet er i behold?',
    });
const ingentingIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Ingenting av beløpet',
    });
const heleIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Hele beløpet',
    });
const delerIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Deler av beløpet',
    });

const krevesTilbakeRadioGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: `Skal ${beløpsbeskrivelse} kreves tilbake?`,
    });
const krevesTilbakeJaRadio = async (beløpsbeskrivelse: Beløpsbeskrivelse): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup(beløpsbeskrivelse)).getByRole('radio', { name: 'Ja' });
const krevesTilbakeNeiRadio = async (beløpsbeskrivelse: Beløpsbeskrivelse): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup(beløpsbeskrivelse)).getByRole('radio', { name: 'Nei' });

const beløpTilbakekreves = (): HTMLElement =>
    screen.getByRole('spinbutton', {
        name: 'Hvor mange kroner skal kreves tilbake?',
    });
const beløpIBehold = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Hvor mange kroner er i behold?',
    });

const begrunnelseIBehold = async (
    beløpsbeskrivelse: 'hele beløpet' | 'deler av beløpet'
): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: `Begrunn hvorfor ${beløpsbeskrivelse} er i behold`,
    });
const årsakKrevesTilbakeCheckboxGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: new RegExp(
            `Hva er årsaken\\(e\\) til at ${beløpsbeskrivelse} skal kreves tilbake\\?`
        ),
    });
const årsakKrevesIkkeTilbakeCheckboxGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: new RegExp(
            `Hva er årsaken\\(e\\) til at ${beløpsbeskrivelse} ikke skal kreves tilbake\\?`
        ),
    });
const begrunnelseKreves = (beløpsbeskrivelse: Beløpsbeskrivelse): HTMLElement =>
    screen.getByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} skal kreves tilbake`,
    });
const begrunnelseKrevesIkke = (beløpsbeskrivelse: Beløpsbeskrivelse): HTMLElement =>
    screen.getByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} ikke skal kreves tilbake`,
    });

const annetCheckbox = (gruppe: HTMLElement): HTMLElement =>
    within(gruppe).getByRole('checkbox', { name: 'Annet' });
const beskrivAnnetFinnes = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Beskriv kort hva du legger i alternativet “Annet”',
    });
const beskrivAnnetQuery = (): HTMLElement | null =>
    screen.queryByRole('textbox', {
        name: 'Beskriv kort hva du legger i alternativet “Annet”',
    });

describe('VilkårsvurderingDetaljer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
    });

    describe('Forsto eller burde forstått', () => {
        describe('Forsto', () => {
            const velgForsto = async (
                simulertBeløp: number | null = 10000,
                erUnder4xRettsgebyr = false
            ): Promise<void> => {
                renderVilkårsDetaljer(simulertBeløp, erUnder4xRettsgebyr);
                user.click(forstoEllerBurdeForståttRadio());
                user.click(await forstoRadio());
                expect(await begrunnelseForstoEllerBurdeForstått('forsto')).toBeInTheDocument();
            };
            særligeGrunnerSuite(velgForsto, false);

            test('Under 4x rettsgebyr - Ja, Nav skal la være å kreve beløpet tilbake', async () => {
                await velgForsto(0, true);

                user.click(await under4xJaRadio());
                expect(await begrunnelseSkalUnnlates()).toBeInTheDocument();
                expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
                expect(screen.getByText('0 kroner')).toBeInTheDocument();
            });

            test('Under 4x rettsgebyr - Nei, viser særlige grunner', async () => {
                await velgForsto(10000, true);

                user.click(await under4xNeiRadio());
                expect(await særligeGrunnerRadioGroup()).toBeInTheDocument();
            });

            test('Skal ha "Nei" som standardvalg for særlige grunner', async () => {
                await velgForsto();

                expect(await særligeGrunnerNeiRadio()).toBeChecked();
                expect(await særligeGrunnerCheckboxGroup('mot')).toBeInTheDocument();
                expect(await begrunnelseSærligeGrunner('mot')).toBeInTheDocument();
            });
        });

        describe('Burde forstått', () => {
            const velgBurdeForstått = async (
                simulertBeløp: number | null = 10000,
                erUnder4xRettsgebyr = false
            ): Promise<void> => {
                renderVilkårsDetaljer(simulertBeløp, erUnder4xRettsgebyr);
                user.click(forstoEllerBurdeForståttRadio());
                user.click(await burdeForståttRadio());
                expect(
                    await begrunnelseForstoEllerBurdeForstått('burde forstått')
                ).toBeInTheDocument();
            };
            særligeGrunnerSuite(velgBurdeForstått, false);

            test('Under 4x rettsgebyr - Ja, Nav skal la være å kreve beløpet tilbake', async () => {
                await velgBurdeForstått(0, true);

                user.click(await under4xJaRadio());
                expect(await begrunnelseSkalUnnlates()).toBeInTheDocument();
                expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
                expect(screen.getByText('0 kroner')).toBeInTheDocument();
            });

            test('Under 4x rettsgebyr - Nei, viser begrunnelse og særlige grunner', async () => {
                await velgBurdeForstått(10000, true);

                user.click(await under4xNeiRadio());
                expect(await begrunnelseSkalIkkeUnnlates()).toBeInTheDocument();
                expect(await særligeGrunnerRadioGroup()).toBeInTheDocument();
            });
        });
    });

    describe('God tro', () => {
        test('Ingenting i behold', async () => {
            renderVilkårsDetaljer(0);

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(ingentingIBeholdRadio());
            expect(await begrunnelseIngenting()).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Hele beløpet i behold - Kreves tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            expect(await begrunnelseIBehold('hele beløpet')).toBeInTheDocument();

            user.click(await krevesTilbakeJaRadio('hele beløpet'));
            expect(await årsakKrevesTilbakeCheckboxGroup('hele beløpet')).toBeInTheDocument();
            expect(begrunnelseKreves('hele beløpet')).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('10 000 kroner')).toBeInTheDocument();
        });

        test('Hele beløpet i behold - Kreves ikke tilbake', async () => {
            renderVilkårsDetaljer(0);

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            expect(await begrunnelseIBehold('hele beløpet')).toBeInTheDocument();

            user.click(await krevesTilbakeNeiRadio('hele beløpet'));
            expect(await årsakKrevesIkkeTilbakeCheckboxGroup('hele beløpet')).toBeInTheDocument();
            expect(begrunnelseKrevesIkke('hele beløpet')).toBeInTheDocument();
            expect(beløpTilbakekreves()).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Deler av beløpet i behold - Kreves tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(delerIBeholdRadio());
            expect(await begrunnelseIBehold('deler av beløpet')).toBeInTheDocument();
            expect(beløpIBehold()).toBeInTheDocument();

            user.click(await krevesTilbakeJaRadio('hele beløpet som er i behold'));
            expect(
                await årsakKrevesTilbakeCheckboxGroup('hele beløpet som er i behold')
            ).toBeInTheDocument();
            expect(begrunnelseKreves('hele beløpet som er i behold')).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('10 000 kroner')).toBeInTheDocument();
        });

        test('Deler av beløpet i behold - Kreves ikke tilbake', async () => {
            renderVilkårsDetaljer(0);

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(delerIBeholdRadio());
            expect(await begrunnelseIBehold('deler av beløpet')).toBeInTheDocument();
            expect(beløpIBehold()).toBeInTheDocument();

            user.click(await krevesTilbakeNeiRadio('hele beløpet som er i behold'));
            expect(
                await årsakKrevesIkkeTilbakeCheckboxGroup('hele beløpet som er i behold')
            ).toBeInTheDocument();
            expect(begrunnelseKrevesIkke('hele beløpet som er i behold')).toBeInTheDocument();
            expect(beløpTilbakekreves()).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Annet-alternativ viser fritekstfelt', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            user.click(await krevesTilbakeJaRadio('hele beløpet'));

            const gruppe = await årsakKrevesTilbakeCheckboxGroup('hele beløpet');
            expect(beskrivAnnetQuery()).not.toBeInTheDocument();

            user.click(annetCheckbox(gruppe));
            expect(await beskrivAnnetFinnes()).toBeInTheDocument();
        });
    });

    describe('Forårsaket av mottaker', () => {
        test('Forsett', async () => {
            renderVilkårsDetaljer();
            user.click(forårsaketAvMottakerRadio());
            user.click(await forsettRadio());
            expect(await begrunnelseForårsaketAvMottakeren('med forsett')).toBeInTheDocument();
            expect(screen.queryByText('Reduksjon')).not.toBeInTheDocument();
            expect(screen.getByText('Renter')).toBeInTheDocument();
            expect(screen.getByText('10 %')).toBeInTheDocument();
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('10 000 kroner')).toBeInTheDocument();
        });

        test('Forsett - simulertBeløp - null - skjuler beløpet', async () => {
            renderVilkårsDetaljer(null);
            user.click(forårsaketAvMottakerRadio());
            user.click(await forsettRadio());
            expect(await begrunnelseForårsaketAvMottakeren('med forsett')).toBeInTheDocument();
            expect(screen.getByText('Renter')).toBeInTheDocument();
            expect(screen.getByText('10 %')).toBeInTheDocument();
            expect(screen.queryByText('Beløpet som skal kreves tilbake')).not.toBeInTheDocument();
        });

        describe('Grovt uaktsom', () => {
            const velgGrovtUaktsom = async (): Promise<void> => {
                renderVilkårsDetaljer();
                user.click(forårsaketAvMottakerRadio());
                user.click(await grovtUaktsomRadio());
                expect(
                    await begrunnelseForårsaketAvMottakeren('grovt uaktsomt')
                ).toBeInTheDocument();
            };
            særligeGrunnerSuite(velgGrovtUaktsom, true);
        });

        describe('Uaktsom', () => {
            const velgUaktsom = async (
                simulertBeløp: number | null = 10000,
                erUnder4xRettsgebyr = false
            ): Promise<void> => {
                renderVilkårsDetaljer(simulertBeløp, erUnder4xRettsgebyr);
                user.click(forårsaketAvMottakerRadio());
                user.click(await uaktsomRadio());
                expect(await begrunnelseForårsaketAvMottakeren('uaktsomt')).toBeInTheDocument();
            };
            særligeGrunnerSuite(velgUaktsom, false);

            test('Under 4x rettsgebyr - Ja, Nav skal la være å kreve beløpet tilbake', async () => {
                await velgUaktsom(0, true);

                user.click(await under4xJaRadio());
                expect(await begrunnelseSkalUnnlates()).toBeInTheDocument();
                expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
                expect(screen.getByText('0 kroner')).toBeInTheDocument();
            });

            test('Under 4x rettsgebyr - Nei, viser begrunnelse og særlige grunner', async () => {
                await velgUaktsom(10000, true);

                user.click(await under4xNeiRadio());
                expect(await begrunnelseSkalIkkeUnnlates()).toBeInTheDocument();
                expect(await særligeGrunnerRadioGroup()).toBeInTheDocument();
            });
        });
    });

    const særligeGrunnerSuite = (
        velgUaktsomhetsgrad: () => Promise<void>,
        forventRenter: boolean
    ): void => {
        test('Ja - særlige grunner skal redusere beløpet', async () => {
            await velgUaktsomhetsgrad();

            user.click(await særligeGrunnerJaRadio());
            expect(await særligeGrunnerCheckboxGroup('for')).toBeInTheDocument();
            expect(await begrunnelseSærligeGrunner('for')).toBeInTheDocument();

            expect(await reduksjonsprosentField()).toBeInTheDocument();
            expect(screen.getByText('Reduksjon')).toBeInTheDocument();

            if (forventRenter) {
                expect(screen.getByText('Renter')).toBeInTheDocument();
            } else {
                expect(screen.queryByText('Renter')).not.toBeInTheDocument();
            }
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('10 000 kroner')).toBeInTheDocument();
        });

        test('Nei - særlige grunner skal ikke redusere beløpet', async () => {
            await velgUaktsomhetsgrad();

            user.click(await særligeGrunnerNeiRadio());
            expect(await særligeGrunnerCheckboxGroup('mot')).toBeInTheDocument();
            expect(await begrunnelseSærligeGrunner('mot')).toBeInTheDocument();
            expect(screen.queryByText('Reduksjon')).not.toBeInTheDocument();
            if (forventRenter) {
                expect(screen.getByText('Renter')).toBeInTheDocument();
            } else {
                expect(screen.queryByText('Renter')).not.toBeInTheDocument();
            }
            expect(screen.getByText('Beløpet som skal kreves tilbake')).toBeInTheDocument();
            expect(screen.getByText('10 000 kroner')).toBeInTheDocument();
        });

        test('Ja - Annet-alternativ viser fritekstfelt', async () => {
            await velgUaktsomhetsgrad();

            user.click(await særligeGrunnerJaRadio());
            const gruppe = await særligeGrunnerCheckboxGroup('for');
            expect(beskrivAnnetQuery()).not.toBeInTheDocument();

            user.click(annetCheckbox(gruppe));
            expect(await beskrivAnnetFinnes()).toBeInTheDocument();
        });

        test('Nei - Annet-alternativ viser fritekstfelt', async () => {
            await velgUaktsomhetsgrad();

            user.click(await særligeGrunnerNeiRadio());
            const gruppe = await særligeGrunnerCheckboxGroup('mot');
            expect(beskrivAnnetQuery()).not.toBeInTheDocument();

            user.click(annetCheckbox(gruppe));
            expect(await beskrivAnnetFinnes()).toBeInTheDocument();
        });
    };

    describe('Utledede defaultValues', () => {
        const renderMedValg = (
            valg: Vilkaarsvurdering['valg'],
            erUnder4xRettsgebyr = false
        ): void => {
            const vilkårsperiode: Vilkaarsperiode = {
                ...lagVilkårsperiode(10000),
                vilkårsvurdering: {
                    id: valgtPeriode.id,
                    periode: { fom: '2023-01-01', tom: '2023-12-31' },
                    delbarePerioder: [],
                    valg,
                },
            };
            render(
                <QueryClientProvider client={createTestQueryClient()}>
                    <TestBehandlingProvider>
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
        };

        const skalKrevesTilbakeReduksjon: Reduksjon = {
            reduksjon: 'skalIkkeReduseres',
            relevans: [{ moment: 'MOTTAKER_TILLIT', beskrivelse: '' }],
            annetBegrunnelse: null,
            begrunnelse: 'Begrunnelse for at beløpet skal kreves tilbake',
        };
        const skalReduseresReduksjon: Reduksjon = {
            reduksjon: 'skalReduseres',
            beløp: 2500,
            relevans: [
                { moment: 'STØRRELSE_BELØP', beskrivelse: '' },
                { moment: 'ANNET', beskrivelse: '' },
            ],
            annetBegrunnelse: 'Annet-begrunnelse for reduksjon',
            begrunnelse: 'Begrunnelse for at beløpet ikke skal kreves tilbake',
        };

        describe('God tro', () => {
            test('ingenting i behold fyller begrunnelsene', async () => {
                renderMedValg({
                    vurdering: 'god_tro',
                    begrunnelse: 'Mottaker var i aktsom god tro',
                    beløpIBehold: {
                        belopIBehold: 'ingenting',
                        begrunnelse: 'Ingenting av beløpet er i behold',
                    },
                });

                expect(await begrunnelseGodTro()).toHaveValue('Mottaker var i aktsom god tro');
                expect(ingentingIBeholdRadio()).toBeChecked();
                expect(await begrunnelseIngenting()).toHaveValue(
                    'Ingenting av beløpet er i behold'
                );
            });

            test('hele i behold og kreves tilbake (skalIkkeReduseres) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'god_tro',
                    begrunnelse: 'God tro-begrunnelse',
                    beløpIBehold: {
                        belopIBehold: 'hele',
                        begrunnelse: 'Hele beløpet er i behold',
                        reduksjon: skalKrevesTilbakeReduksjon,
                    },
                });

                expect(await begrunnelseGodTro()).toHaveValue('God tro-begrunnelse');
                expect(heleIBeholdRadio()).toBeChecked();
                expect(await begrunnelseIBehold('hele beløpet')).toHaveValue(
                    'Hele beløpet er i behold'
                );
                expect(await krevesTilbakeJaRadio('hele beløpet')).toBeChecked();

                const gruppe = await årsakKrevesTilbakeCheckboxGroup('hele beløpet');
                expect(
                    within(gruppe).getByRole('checkbox', {
                        name: 'Om mottakeren har innrettet seg i tillit til utbetalingen',
                    })
                ).toBeChecked();
                expect(
                    within(gruppe).getByRole('checkbox', { name: 'Størrelsen på beløpet' })
                ).not.toBeChecked();
                expect(begrunnelseKreves('hele beløpet')).toHaveValue(
                    'Begrunnelse for at beløpet skal kreves tilbake'
                );
            });

            test('hele i behold og skal reduseres (skalReduseres) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'god_tro',
                    begrunnelse: 'God tro-begrunnelse',
                    beløpIBehold: {
                        belopIBehold: 'hele',
                        begrunnelse: 'Hele beløpet er i behold',
                        reduksjon: skalReduseresReduksjon,
                    },
                });

                expect(heleIBeholdRadio()).toBeChecked();
                expect(await krevesTilbakeNeiRadio('hele beløpet')).toBeChecked();

                const gruppe = await årsakKrevesIkkeTilbakeCheckboxGroup('hele beløpet');
                expect(
                    within(gruppe).getByRole('checkbox', { name: 'Størrelsen på beløpet' })
                ).toBeChecked();
                expect(within(gruppe).getByRole('checkbox', { name: 'Annet' })).toBeChecked();
                expect(await beskrivAnnetFinnes()).toHaveValue('Annet-begrunnelse for reduksjon');
                expect(begrunnelseKrevesIkke('hele beløpet')).toHaveValue(
                    'Begrunnelse for at beløpet ikke skal kreves tilbake'
                );
                expect(beløpTilbakekreves()).toHaveValue(2500);
            });

            test('deler i behold og kreves tilbake (skalIkkeReduseres) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'god_tro',
                    begrunnelse: 'God tro-begrunnelse',
                    beløpIBehold: {
                        belopIBehold: 'deler',
                        beløp: 4000,
                        begrunnelse: 'Deler av beløpet er i behold',
                        reduksjon: skalKrevesTilbakeReduksjon,
                    },
                });

                expect(delerIBeholdRadio()).toBeChecked();
                expect(await begrunnelseIBehold('deler av beløpet')).toHaveValue(
                    'Deler av beløpet er i behold'
                );
                expect(beløpIBehold()).toHaveValue('4000');
                expect(await krevesTilbakeJaRadio('hele beløpet som er i behold')).toBeChecked();

                const gruppe = await årsakKrevesTilbakeCheckboxGroup(
                    'hele beløpet som er i behold'
                );
                expect(
                    within(gruppe).getByRole('checkbox', {
                        name: 'Om mottakeren har innrettet seg i tillit til utbetalingen',
                    })
                ).toBeChecked();
                expect(begrunnelseKreves('hele beløpet som er i behold')).toHaveValue(
                    'Begrunnelse for at beløpet skal kreves tilbake'
                );
            });

            test('deler i behold og skal reduseres (skalReduseres) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'god_tro',
                    begrunnelse: 'God tro-begrunnelse',
                    beløpIBehold: {
                        belopIBehold: 'deler',
                        beløp: 4000,
                        begrunnelse: 'Deler av beløpet er i behold',
                        reduksjon: skalReduseresReduksjon,
                    },
                });

                expect(delerIBeholdRadio()).toBeChecked();
                expect(beløpIBehold()).toHaveValue('4000');
                expect(await krevesTilbakeNeiRadio('hele beløpet som er i behold')).toBeChecked();

                const gruppe = await årsakKrevesIkkeTilbakeCheckboxGroup(
                    'hele beløpet som er i behold'
                );
                expect(
                    within(gruppe).getByRole('checkbox', { name: 'Størrelsen på beløpet' })
                ).toBeChecked();
                expect(within(gruppe).getByRole('checkbox', { name: 'Annet' })).toBeChecked();
                expect(await beskrivAnnetFinnes()).toHaveValue('Annet-begrunnelse for reduksjon');
                expect(begrunnelseKrevesIkke('hele beløpet som er i behold')).toHaveValue(
                    'Begrunnelse for at beløpet ikke skal kreves tilbake'
                );
                expect(beløpTilbakekreves()).toHaveValue(2500);
            });
        });

        describe('Forårsaket av mottaker', () => {
            const særligeGrunnerFor: SaerligeGrunner = {
                erDetSaerligeGrunner: 'ja',
                særligeGrunnerFor: [{ moment: 'GRAD_AV_UAKTSOMHET', beskrivelse: '' }],
                prosentReduksjon: 40,
                begrunnelse: 'Begrunnelse for særlige grunner',
                annetBegrunnelse: null,
            };
            const særligeGrunnerMot: SaerligeGrunner = {
                erDetSaerligeGrunner: 'nei',
                særligeGrunnerMot: [{ moment: 'GRAD_AV_UAKTSOMHET', beskrivelse: '' }],
                begrunnelse: 'Begrunnelse mot særlige grunner',
                annetBegrunnelse: null,
            };

            test('forsettlig fyller begrunnelsen', async () => {
                renderMedValg({
                    vurdering: 'forårsaket_av_mottaker',
                    aktsomhet: {
                        aktsomhet: 'forsettlig',
                        begrunnelse: 'Mottaker handlet med forsett',
                    },
                });

                expect(await forsettRadio()).toBeChecked();
                expect(await begrunnelseForårsaketAvMottakeren('med forsett')).toHaveValue(
                    'Mottaker handlet med forsett'
                );
            });

            test('grovt uaktsomt med særlige grunner for (ja) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'forårsaket_av_mottaker',
                    aktsomhet: {
                        aktsomhet: 'grovtUaktsomt',
                        begrunnelse: 'Mottaker handlet grovt uaktsomt',
                        erDetSærligeGrunner: særligeGrunnerFor,
                    },
                });

                expect(await grovtUaktsomRadio()).toBeChecked();
                expect(await begrunnelseForårsaketAvMottakeren('grovt uaktsomt')).toHaveValue(
                    'Mottaker handlet grovt uaktsomt'
                );
                expect(await særligeGrunnerJaRadio()).toBeChecked();
                expect(
                    within(await særligeGrunnerCheckboxGroup('for')).getByRole('checkbox', {
                        name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                    })
                ).toBeChecked();
                expect(await begrunnelseSærligeGrunner('for')).toHaveValue(
                    'Begrunnelse for særlige grunner'
                );
                expect(await reduksjonsprosentField()).toHaveValue(40);
            });

            test('grovt uaktsomt med særlige grunner mot (nei) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'forårsaket_av_mottaker',
                    aktsomhet: {
                        aktsomhet: 'grovtUaktsomt',
                        begrunnelse: 'Mottaker handlet grovt uaktsomt',
                        erDetSærligeGrunner: særligeGrunnerMot,
                    },
                });

                expect(await grovtUaktsomRadio()).toBeChecked();
                expect(await særligeGrunnerNeiRadio()).toBeChecked();
                expect(
                    within(await særligeGrunnerCheckboxGroup('mot')).getByRole('checkbox', {
                        name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                    })
                ).toBeChecked();
                expect(await begrunnelseSærligeGrunner('mot')).toHaveValue(
                    'Begrunnelse mot særlige grunner'
                );
            });

            test('uaktsomt med unnlatelse under 4x rettsgebyr (skalUnnlates) fyller skjemaet', async () => {
                renderMedValg(
                    {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'uaktsomt',
                            begrunnelse: 'Mottaker handlet uaktsomt',
                            unnlatelse: {
                                unnlatelse: 'skalUnnlates',
                                begrunnelse: 'Nav skal la være å kreve beløpet tilbake',
                            },
                        },
                    },
                    true
                );

                expect(await uaktsomRadio()).toBeChecked();
                expect(await begrunnelseForårsaketAvMottakeren('uaktsomt')).toHaveValue(
                    'Mottaker handlet uaktsomt'
                );
                expect(await under4xJaRadio()).toBeChecked();
                expect(await begrunnelseSkalUnnlates()).toHaveValue(
                    'Nav skal la være å kreve beløpet tilbake'
                );
            });

            test('uaktsomt med unnlatelse under 4x rettsgebyr (skalIkkeUnnlates) fyller skjemaet', async () => {
                renderMedValg(
                    {
                        vurdering: 'forårsaket_av_mottaker',
                        aktsomhet: {
                            aktsomhet: 'uaktsomt',
                            begrunnelse: 'Mottaker handlet uaktsomt',
                            unnlatelse: {
                                unnlatelse: 'skalIkkeUnnlates',
                                begrunnelse: 'Nav skal ikke la være å kreve beløpet tilbake',
                                erDetSærligeGrunner: særligeGrunnerMot,
                            },
                        },
                    },
                    true
                );

                expect(await uaktsomRadio()).toBeChecked();
                expect(await under4xNeiRadio()).toBeChecked();
                expect(await særligeGrunnerNeiRadio()).toBeChecked();
                expect(
                    within(await særligeGrunnerCheckboxGroup('mot')).getByRole('checkbox', {
                        name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                    })
                ).toBeChecked();
                expect(await begrunnelseSærligeGrunner('mot')).toHaveValue(
                    'Begrunnelse mot særlige grunner'
                );
            });

            test('uaktsomt med unnlatelse over 4x rettsgebyr (ikkeAktuelt) fyller skjemaet', async () => {
                renderMedValg({
                    vurdering: 'forårsaket_av_mottaker',
                    aktsomhet: {
                        aktsomhet: 'uaktsomt',
                        begrunnelse: 'Mottaker handlet uaktsomt',
                        unnlatelse: {
                            unnlatelse: 'ikkeAktuelt',
                            erDetSærligeGrunner: særligeGrunnerFor,
                        },
                    },
                });

                expect(await uaktsomRadio()).toBeChecked();
                expect(await særligeGrunnerJaRadio()).toBeChecked();
                expect(
                    within(await særligeGrunnerCheckboxGroup('for')).getByRole('checkbox', {
                        name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                    })
                ).toBeChecked();
                expect(await begrunnelseSærligeGrunner('for')).toHaveValue(
                    'Begrunnelse for særlige grunner'
                );
                expect(await reduksjonsprosentField()).toHaveValue(40);
            });
        });

        describe('Forsto eller burde forstått', () => {
            const særligeGrunnerFor: SaerligeGrunner = {
                erDetSaerligeGrunner: 'ja',
                særligeGrunnerFor: [{ moment: 'GRAD_AV_UAKTSOMHET', beskrivelse: '' }],
                prosentReduksjon: 40,
                begrunnelse: 'Begrunnelse for særlige grunner',
                annetBegrunnelse: null,
            };
            const særligeGrunnerMot: SaerligeGrunner = {
                erDetSaerligeGrunner: 'nei',
                særligeGrunnerMot: [{ moment: 'GRAD_AV_UAKTSOMHET', beskrivelse: '' }],
                begrunnelse: 'Begrunnelse mot særlige grunner',
                annetBegrunnelse: null,
            };

            describe('Forsto', () => {
                test('med unnlatelse over 4x rettsgebyr (ikkeAktuelt) fyller skjemaet', async () => {
                    renderMedValg({
                        vurdering: 'forsto_eller_burde_forstått',
                        forståelse: {
                            forståelse: 'forsto',
                            begrunnelse: 'Mottaker forsto feilen',
                            unnlatelse: {
                                unnlatelse: 'ikkeAktuelt',
                                erDetSærligeGrunner: særligeGrunnerFor,
                            },
                        },
                    });

                    expect(await forstoRadio()).toBeChecked();
                    expect(await begrunnelseForstoEllerBurdeForstått('forsto')).toHaveValue(
                        'Mottaker forsto feilen'
                    );
                    expect(await særligeGrunnerJaRadio()).toBeChecked();
                    expect(
                        within(await særligeGrunnerCheckboxGroup('for')).getByRole('checkbox', {
                            name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                        })
                    ).toBeChecked();
                    expect(await begrunnelseSærligeGrunner('for')).toHaveValue(
                        'Begrunnelse for særlige grunner'
                    );
                    expect(await reduksjonsprosentField()).toHaveValue(40);
                });

                test('med unnlatelse under 4x rettsgebyr (skalUnnlates) fyller skjemaet', async () => {
                    renderMedValg(
                        {
                            vurdering: 'forsto_eller_burde_forstått',
                            forståelse: {
                                forståelse: 'forsto',
                                begrunnelse: 'Mottaker forsto feilen',
                                unnlatelse: {
                                    unnlatelse: 'skalUnnlates',
                                    begrunnelse: 'Nav skal la være å kreve beløpet tilbake',
                                },
                            },
                        },
                        true
                    );

                    expect(await forstoRadio()).toBeChecked();
                    expect(await under4xJaRadio()).toBeChecked();
                    expect(await begrunnelseSkalUnnlates()).toHaveValue(
                        'Nav skal la være å kreve beløpet tilbake'
                    );
                });

                test('med unnlatelse under 4x rettsgebyr (skalIkkeUnnlates) fyller skjemaet', async () => {
                    renderMedValg(
                        {
                            vurdering: 'forsto_eller_burde_forstått',
                            forståelse: {
                                forståelse: 'forsto',
                                begrunnelse: 'Mottaker forsto feilen',
                                unnlatelse: {
                                    unnlatelse: 'skalIkkeUnnlates',
                                    begrunnelse: 'Nav skal ikke la være å kreve beløpet tilbake',
                                    erDetSærligeGrunner: særligeGrunnerMot,
                                },
                            },
                        },
                        true
                    );

                    expect(await forstoRadio()).toBeChecked();
                    expect(await under4xNeiRadio()).toBeChecked();
                    expect(await begrunnelseSkalIkkeUnnlates()).toHaveValue(
                        'Nav skal ikke la være å kreve beløpet tilbake'
                    );
                    expect(await særligeGrunnerNeiRadio()).toBeChecked();
                    expect(await begrunnelseSærligeGrunner('mot')).toHaveValue(
                        'Begrunnelse mot særlige grunner'
                    );
                });
            });

            describe('Burde forstått', () => {
                test('med unnlatelse over 4x rettsgebyr (ikkeAktuelt) fyller skjemaet', async () => {
                    renderMedValg({
                        vurdering: 'forsto_eller_burde_forstått',
                        forståelse: {
                            forståelse: 'burdeForstått',
                            begrunnelse: 'Mottaker burde forstått feilen',
                            unnlatelse: {
                                unnlatelse: 'ikkeAktuelt',
                                erDetSærligeGrunner: særligeGrunnerFor,
                            },
                        },
                    });

                    expect(await burdeForståttRadio()).toBeChecked();
                    expect(await begrunnelseForstoEllerBurdeForstått('burde forstått')).toHaveValue(
                        'Mottaker burde forstått feilen'
                    );
                    expect(await særligeGrunnerJaRadio()).toBeChecked();
                    expect(
                        within(await særligeGrunnerCheckboxGroup('for')).getByRole('checkbox', {
                            name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
                        })
                    ).toBeChecked();
                    expect(await begrunnelseSærligeGrunner('for')).toHaveValue(
                        'Begrunnelse for særlige grunner'
                    );
                    expect(await reduksjonsprosentField()).toHaveValue(40);
                });

                test('med unnlatelse under 4x rettsgebyr (skalUnnlates) fyller skjemaet', async () => {
                    renderMedValg(
                        {
                            vurdering: 'forsto_eller_burde_forstått',
                            forståelse: {
                                forståelse: 'burdeForstått',
                                begrunnelse: 'Mottaker burde forstått feilen',
                                unnlatelse: {
                                    unnlatelse: 'skalUnnlates',
                                    begrunnelse: 'Nav skal la være å kreve beløpet tilbake',
                                },
                            },
                        },
                        true
                    );

                    expect(await burdeForståttRadio()).toBeChecked();
                    expect(await under4xJaRadio()).toBeChecked();
                    expect(await begrunnelseSkalUnnlates()).toHaveValue(
                        'Nav skal la være å kreve beløpet tilbake'
                    );
                });

                test('med unnlatelse under 4x rettsgebyr (skalIkkeUnnlates) fyller skjemaet', async () => {
                    renderMedValg(
                        {
                            vurdering: 'forsto_eller_burde_forstått',
                            forståelse: {
                                forståelse: 'burdeForstått',
                                begrunnelse: 'Mottaker burde forstått feilen',
                                unnlatelse: {
                                    unnlatelse: 'skalIkkeUnnlates',
                                    begrunnelse: 'Nav skal ikke la være å kreve beløpet tilbake',
                                    erDetSærligeGrunner: særligeGrunnerMot,
                                },
                            },
                        },
                        true
                    );

                    expect(await burdeForståttRadio()).toBeChecked();
                    expect(await under4xNeiRadio()).toBeChecked();
                    expect(await begrunnelseSkalIkkeUnnlates()).toHaveValue(
                        'Nav skal ikke la være å kreve beløpet tilbake'
                    );
                    expect(await særligeGrunnerNeiRadio()).toBeChecked();
                    expect(await begrunnelseSærligeGrunner('mot')).toHaveValue(
                        'Begrunnelse mot særlige grunner'
                    );
                });
            });
        });
    });
});
