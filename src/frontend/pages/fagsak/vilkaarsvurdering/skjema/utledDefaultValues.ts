import type { ReduksjonArsaker, Unnlatelse, Vilkaarsvurdering } from '@/generated-new';
import type { ReduksjonFelter, SærligeGrunnerFelter, VilkårsvurderingSkjemaFelter } from './schema';

const tomReduksjon = (): ReduksjonFelter => ({
    erDetReduksjonÅrsaker: '',
    jaGodTro: {
        prosentReduksjon: null,
        relevans: [],
        annetBegrunnelse: '',
        begrunnelse: '',
    },
    neiGodTro: {
        relevans: [],
        annetBegrunnelse: '',
        begrunnelse: '',
    },
});

const utledReduksjon = (reduksjon: ReduksjonArsaker): ReduksjonFelter => {
    const felter = tomReduksjon();
    if (reduksjon.erDetReduksjonÅrsaker === 'jaGodTro') {
        felter.erDetReduksjonÅrsaker = 'jaGodTro';
        felter.jaGodTro = {
            prosentReduksjon: reduksjon.prosentReduksjon,
            relevans: reduksjon.relevans.map(({ moment }) => moment),
            annetBegrunnelse: reduksjon.annetBegrunnelse ?? '',
            begrunnelse: reduksjon.begrunnelse,
        };
    } else if (reduksjon.erDetReduksjonÅrsaker === 'neiGodTro') {
        felter.erDetReduksjonÅrsaker = 'neiGodTro';
        felter.neiGodTro = {
            relevans: reduksjon.relevans.map(({ moment }) => moment),
            annetBegrunnelse: reduksjon.annetBegrunnelse ?? '',
            begrunnelse: reduksjon.begrunnelse,
        };
    }
    return felter;
};

const tomSærligeGrunner = (
    erDetReduksjonÅrsaker: SærligeGrunnerFelter['erDetReduksjonÅrsaker'] = ''
): SærligeGrunnerFelter => ({
    erDetReduksjonÅrsaker,
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

const utledSærligeGrunner = (særligeGrunner: ReduksjonArsaker): SærligeGrunnerFelter => {
    const felter = tomSærligeGrunner();
    if (særligeGrunner.erDetReduksjonÅrsaker === 'ja') {
        felter.erDetReduksjonÅrsaker = 'ja';
        felter.jaSærligeGrunner = {
            særligeGrunnerFor: særligeGrunner.særligeGrunnerFor.map(({ moment }) => moment),
            prosentReduksjon: særligeGrunner.prosentReduksjon,
            begrunnelse: særligeGrunner.begrunnelse,
            annetBegrunnelse: særligeGrunner.annetBegrunnelse ?? '',
        };
    } else if (særligeGrunner.erDetReduksjonÅrsaker === 'nei') {
        felter.erDetReduksjonÅrsaker = 'nei';
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
    erDetReduksjonÅrsaker: SærligeGrunnerFelter['erDetReduksjonÅrsaker'] = ''
): UnnlatelseFelter => ({
    unnlatelse: '',
    skalUnnlates: {
        begrunnelse: '',
    },
    skalIkkeUnnlates: {
        begrunnelse: '',
        erDetSærligeGrunner: tomSærligeGrunner(erDetReduksjonÅrsaker),
    },
    ikkeAktuelt: {
        erDetSærligeGrunner: tomSærligeGrunner(erDetReduksjonÅrsaker),
    },
});

const hentSærligeGrunner = (unnlatelse: Unnlatelse): SærligeGrunnerFelter | null =>
    unnlatelse.unnlatelse === 'skalUnnlates'
        ? null
        : utledSærligeGrunner(unnlatelse.erDetSærligeGrunner);

const utledUnnlatelse = (
    unnlatelse: Unnlatelse,
    erUnder4xRettsgebyr: boolean
): UnnlatelseFelter => {
    const felter = tomUnnlatelse();
    const særligeGrunner = hentSærligeGrunner(unnlatelse);

    if (!erUnder4xRettsgebyr) {
        felter.unnlatelse = 'ikkeAktuelt';
        if (særligeGrunner) {
            felter.ikkeAktuelt = { erDetSærligeGrunner: særligeGrunner };
        }
        return felter;
    }

    switch (unnlatelse.unnlatelse) {
        case 'skalUnnlates':
            felter.unnlatelse = 'skalUnnlates';
            felter.skalUnnlates = { begrunnelse: unnlatelse.begrunnelse };
            return felter;
        case 'skalIkkeUnnlates':
            felter.unnlatelse = 'skalIkkeUnnlates';
            felter.skalIkkeUnnlates = {
                begrunnelse: unnlatelse.begrunnelse,
                erDetSærligeGrunner: særligeGrunner ?? tomSærligeGrunner(),
            };
            return felter;
        case 'ikkeAktuelt':
            felter.unnlatelse = 'skalIkkeUnnlates';
            felter.skalIkkeUnnlates = {
                begrunnelse: '',
                erDetSærligeGrunner: særligeGrunner ?? tomSærligeGrunner(),
            };
            return felter;
    }
};

export const utledDefaultValues = (
    vilkårsvurdering: Vilkaarsvurdering,
    simulertBeløp: number,
    erVurdert: boolean,
    erUnder4xRettsgebyr: boolean
): VilkårsvurderingSkjemaFelter => {
    const { id, valg } = vilkårsvurdering;

    const defaultValues: VilkårsvurderingSkjemaFelter = {
        id,
        simulertBeløp,
        erVurdert,
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
                    unnlatelse: utledUnnlatelse(forståelse.unnlatelse, erUnder4xRettsgebyr),
                };
                break;
            case 'burdeForstått':
                defaultValues.forstoEllerBurdeForstått.burdeForstått = {
                    begrunnelse: forståelse.begrunnelse,
                    unnlatelse: utledUnnlatelse(forståelse.unnlatelse, erUnder4xRettsgebyr),
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
                    unnlatelse: utledUnnlatelse(valg.aktsomhet.unnlatelse, erUnder4xRettsgebyr),
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
