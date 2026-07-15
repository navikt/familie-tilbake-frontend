import type { Reduksjon, SaerligeGrunner, Unnlatelse, Vilkaarsvurdering } from '@/generated-new';
import type { SærligeGrunnerFelter, VilkårsvurderingSkjemaFelter } from './schema';

type ReduksjonFelter = Pick<
    VilkårsvurderingSkjemaFelter['godTro']['hele'],
    'reduksjon' | 'skalReduseres' | 'skalIkkeReduseres'
>;

const tomReduksjon = (): ReduksjonFelter => ({
    reduksjon: '',
    skalReduseres: {
        beløp: null,
        relevans: [],
        annetBegrunnelse: '',
        begrunnelse: '',
    },
    skalIkkeReduseres: {
        relevans: [],
        annetBegrunnelse: '',
        begrunnelse: '',
    },
});

const utledReduksjon = (reduksjon: Reduksjon): ReduksjonFelter => {
    const felter = tomReduksjon();
    felter.reduksjon = reduksjon.reduksjon;
    if (reduksjon.reduksjon === 'skalReduseres') {
        felter.skalReduseres = {
            beløp: reduksjon.beløp,
            relevans: reduksjon.relevans.map(({ moment }) => moment),
            annetBegrunnelse: reduksjon.annetBegrunnelse ?? '',
            begrunnelse: reduksjon.begrunnelse,
        };
    } else {
        felter.skalIkkeReduseres = {
            relevans: reduksjon.relevans.map(({ moment }) => moment),
            annetBegrunnelse: reduksjon.annetBegrunnelse ?? '',
            begrunnelse: reduksjon.begrunnelse,
        };
    }
    return felter;
};

const tomSærligeGrunner = (
    erDetSaerligeGrunner: SærligeGrunnerFelter['erDetSaerligeGrunner'] = ''
): SærligeGrunnerFelter => ({
    erDetSaerligeGrunner,
    jaSærligeGrunner: {
        særligeGrunnerFor: [],
        prosentReduksjon: null,
        begrunnelse: '',
        annetBegrunnelse: '',
    },
    neiSærligeGrunner: {
        særligeGrunnerMot: [],
        begrunnelse: '',
        annetBegrunnelse: '',
    },
});

const utledSærligeGrunner = (særligeGrunner: SaerligeGrunner): SærligeGrunnerFelter => {
    const felter = tomSærligeGrunner(særligeGrunner.erDetSaerligeGrunner);
    if (særligeGrunner.erDetSaerligeGrunner === 'ja') {
        felter.jaSærligeGrunner = {
            særligeGrunnerFor: særligeGrunner.særligeGrunnerFor.map(({ moment }) => moment),
            prosentReduksjon: særligeGrunner.prosentReduksjon,
            begrunnelse: særligeGrunner.begrunnelse,
            annetBegrunnelse: særligeGrunner.annetBegrunnelse ?? '',
        };
    } else {
        felter.neiSærligeGrunner = {
            særligeGrunnerMot: særligeGrunner.særligeGrunnerMot.map(({ moment }) => moment),
            begrunnelse: særligeGrunner.begrunnelse,
            annetBegrunnelse: særligeGrunner.annetBegrunnelse ?? '',
        };
    }
    return felter;
};

type UnnlatelseFelter =
    VilkårsvurderingSkjemaFelter['forstoEllerBurdeForstått']['forsto']['unnlatelse'];

const tomUnnlatelse = (
    erDetSaerligeGrunner: SærligeGrunnerFelter['erDetSaerligeGrunner'] = ''
): UnnlatelseFelter => ({
    unnlatelse: '',
    skalUnnlates: {
        begrunnelse: '',
    },
    skalIkkeUnnlates: {
        begrunnelse: '',
        erDetSærligeGrunner: tomSærligeGrunner(erDetSaerligeGrunner),
    },
    ikkeAktuelt: {
        erDetSærligeGrunner: tomSærligeGrunner(erDetSaerligeGrunner),
    },
});

const utledUnnlatelse = (unnlatelse: Unnlatelse): UnnlatelseFelter => {
    const felter = tomUnnlatelse();
    felter.unnlatelse = unnlatelse.unnlatelse;
    switch (unnlatelse.unnlatelse) {
        case 'skalUnnlates':
            felter.skalUnnlates = {
                begrunnelse: unnlatelse.begrunnelse,
            };
            break;
        case 'skalIkkeUnnlates':
            felter.skalIkkeUnnlates = {
                begrunnelse: unnlatelse.begrunnelse,
                erDetSærligeGrunner: utledSærligeGrunner(unnlatelse.erDetSærligeGrunner),
            };
            break;
        case 'ikkeAktuelt':
            felter.ikkeAktuelt = {
                erDetSærligeGrunner: utledSærligeGrunner(unnlatelse.erDetSærligeGrunner),
            };
            break;
    }
    return felter;
};

/**
 * Utleder skjemaets defaultValues fra det man får i GET-endepunktet (typen Vilkaar).
 *
 * Kun feltene som finnes i backend-kontrakten fylles ut. Resten står tomme
 * inntil post og validering er på plass.
 */
export const utledDefaultValues = (
    vilkårsvurdering: Vilkaarsvurdering
): VilkårsvurderingSkjemaFelter => {
    const { id, valg } = vilkårsvurdering;

    const defaultValues: VilkårsvurderingSkjemaFelter = {
        id,
        valg: valg.vurdering === 'ikke_vurdert' ? '' : valg.vurdering,
        forstoEllerBurdeForstått: {
            forståelse: '',
            forsto: {
                begrunnelse: '',
                unnlatelse: tomUnnlatelse('nei'),
            },
            burdeForstått: {
                begrunnelse: '',
                unnlatelse: tomUnnlatelse(),
            },
        },
        forårsaketAvMottaker: {
            aktsomhet: '',
            uaktsomt: {
                begrunnelse: '',
                unnlatelse: tomUnnlatelse(),
            },
            grovtUaktsomt: {
                begrunnelse: '',
                erDetSærligeGrunner: tomSærligeGrunner(),
            },
            forsettlig: {
                begrunnelse: '',
            },
        },
        godTro: {
            begrunnelse: '',
            beløpIBehold: '',
            ingenting: {
                begrunnelse: '',
            },
            hele: {
                begrunnelse: '',
                ...tomReduksjon(),
            },
            deler: {
                beløp: null,
                begrunnelse: '',
                ...tomReduksjon(),
            },
        },
    };

    if (valg.vurdering === 'forsto_eller_burde_forstått') {
        const forståelse = valg.forståelse;
        defaultValues.forstoEllerBurdeForstått.forståelse = forståelse.forståelse;
        switch (forståelse.forståelse) {
            case 'forsto':
                defaultValues.forstoEllerBurdeForstått.forsto = {
                    begrunnelse: forståelse.begrunnelse,
                    unnlatelse: utledUnnlatelse(forståelse.unnlatelse),
                };
                break;
            case 'burdeForstått':
                defaultValues.forstoEllerBurdeForstått.burdeForstått = {
                    begrunnelse: forståelse.begrunnelse,
                    unnlatelse: utledUnnlatelse(forståelse.unnlatelse),
                };
                break;
        }
    }

    if (valg.vurdering === 'forårsaket_av_mottaker') {
        defaultValues.forårsaketAvMottaker.aktsomhet = valg.aktsomhet.aktsomhet;
        switch (valg.aktsomhet.aktsomhet) {
            case 'uaktsomt':
                defaultValues.forårsaketAvMottaker.uaktsomt = {
                    begrunnelse: valg.aktsomhet.begrunnelse,
                    unnlatelse: utledUnnlatelse(valg.aktsomhet.unnlatelse),
                };
                break;
            case 'grovtUaktsomt':
                defaultValues.forårsaketAvMottaker.grovtUaktsomt = {
                    begrunnelse: valg.aktsomhet.begrunnelse,
                    erDetSærligeGrunner: utledSærligeGrunner(valg.aktsomhet.erDetSærligeGrunner),
                };
                break;
            case 'forsettlig':
                defaultValues.forårsaketAvMottaker.forsettlig.begrunnelse =
                    valg.aktsomhet.begrunnelse;
                break;
        }
    }

    if (valg.vurdering === 'god_tro') {
        defaultValues.godTro.begrunnelse = valg.begrunnelse;
        const beløpIBehold = valg.beløpIBehold;
        defaultValues.godTro.beløpIBehold = beløpIBehold.belopIBehold;
        switch (beløpIBehold.belopIBehold) {
            case 'ingenting':
                defaultValues.godTro.ingenting.begrunnelse = beløpIBehold.begrunnelse;
                break;
            case 'hele':
                defaultValues.godTro.hele.begrunnelse = beløpIBehold.begrunnelse;
                defaultValues.godTro.hele = {
                    ...defaultValues.godTro.hele,
                    ...utledReduksjon(beløpIBehold.reduksjon),
                };
                break;
            case 'deler':
                defaultValues.godTro.deler.beløp = beløpIBehold.beløp;
                defaultValues.godTro.deler.begrunnelse = beløpIBehold.begrunnelse;
                defaultValues.godTro.deler = {
                    ...defaultValues.godTro.deler,
                    ...utledReduksjon(beløpIBehold.reduksjon),
                };
                break;
        }
    }

    return defaultValues;
};
