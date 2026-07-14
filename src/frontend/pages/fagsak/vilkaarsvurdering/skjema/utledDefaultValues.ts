import type { SaerligeGrunner, Vilkaarsvurdering } from '@/generated-new';
import type { SærligeGrunnerFelter, VilkårsvurderingSkjemaFelter } from './schema';

const tomSærligeGrunner = (
    erDetSærligeGrunner: SærligeGrunnerFelter['erDetSærligeGrunner'] = ''
): SærligeGrunnerFelter => ({
    erDetSærligeGrunner,
    særligeGrunnerFor: [],
    særligeGrunnerMot: [],
    begrunnelse: '',
    annetBegrunnelse: '',
    prosentReduksjon: null,
});

const utledSærligeGrunner = (særligeGrunner: SaerligeGrunner): SærligeGrunnerFelter => {
    if (særligeGrunner.erDetSaerligeGrunner === 'ja') {
        return {
            erDetSærligeGrunner: 'ja',
            særligeGrunnerFor: særligeGrunner.særligeGrunnerFor.map(({ moment }) => moment),
            særligeGrunnerMot: [],
            begrunnelse: særligeGrunner.begrunnelse,
            annetBegrunnelse: særligeGrunner.annetBegrunnelse ?? '',
            prosentReduksjon: særligeGrunner.prosentReduksjon,
        };
    }
    return {
        erDetSærligeGrunner: 'nei',
        særligeGrunnerFor: [],
        særligeGrunnerMot: særligeGrunner.særligeGrunnerMot.map(({ moment }) => moment),
        begrunnelse: særligeGrunner.begrunnelse,
        annetBegrunnelse: særligeGrunner.annetBegrunnelse ?? '',
        prosentReduksjon: null,
    };
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
            forsto: {
                begrunnelse: '',
                særligeGrunner: tomSærligeGrunner('nei'),
            },
            burdeForstått: {
                begrunnelse: '',
                særligeGrunner: tomSærligeGrunner(),
            },
        },
        forårsaketAvMottaker: {
            aktsomhet: '',
            uaktsomt: {
                begrunnelse: '',
                særligeGrunner: tomSærligeGrunner(),
            },
            grovtUaktsomt: {
                begrunnelse: '',
                særligeGrunner: tomSærligeGrunner(),
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
                begrunnelseIBehold: '',
            },
            deler: {
                beløpIBehold: null,
                begrunnelseIBehold: '',
            },
        },
    };

    if (valg.vurdering === 'forårsaket_av_mottaker') {
        defaultValues.forårsaketAvMottaker.aktsomhet = valg.aktsomhet.aktsomhet;
        switch (valg.aktsomhet.aktsomhet) {
            case 'uaktsomt':
                defaultValues.forårsaketAvMottaker.uaktsomt.begrunnelse =
                    valg.aktsomhet.begrunnelse;
                if (valg.aktsomhet.unnlatelse.unnlatelse === 'skalIkkeUnnlates') {
                    defaultValues.forårsaketAvMottaker.uaktsomt.særligeGrunner =
                        utledSærligeGrunner(valg.aktsomhet.unnlatelse.erDetSærligeGrunner);
                }
                break;
            case 'grovtUaktsomt':
                defaultValues.forårsaketAvMottaker.grovtUaktsomt.begrunnelse =
                    valg.aktsomhet.begrunnelse;
                defaultValues.forårsaketAvMottaker.grovtUaktsomt.særligeGrunner =
                    utledSærligeGrunner(valg.aktsomhet.erDetSærligeGrunner);
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
                defaultValues.godTro.hele.begrunnelseIBehold = beløpIBehold.begrunnelse;
                break;
            case 'deler':
                defaultValues.godTro.deler.beløpIBehold = beløpIBehold.beløp;
                defaultValues.godTro.deler.begrunnelseIBehold = beløpIBehold.begrunnelse;
                break;
        }
    }

    return defaultValues;
};
