export type VilkårValg = 'forsto_eller_burde_forstått' | 'forårsaket_av_mottaker' | 'god_tro' | '';

export type AktsomhetValg = 'uaktsomt' | 'grovtUaktsomt' | 'forsettlig' | '';

export type BeløpIBeholdValg = 'ingenting' | 'hele' | 'deler' | '';

export type ErDetSærligeGrunnerValg = 'ja' | 'nei' | '';

export type SærligeGrunnerFelter = {
    erDetSærligeGrunner: ErDetSærligeGrunnerValg;
    /** Valgte momenter (moment-nøkler) som taler for å redusere beløpet. */
    særligeGrunnerFor: string[];
    /** Valgte momenter (moment-nøkler) som taler mot å redusere beløpet. */
    særligeGrunnerMot: string[];
    /** Begrunnelse for vurderingen av om det er særlige grunner. */
    begrunnelse: string;
    /** Utdypende begrunnelse når momentet «Annet» er valgt. */
    annetBegrunnelse: string;
    /** Hvor mange prosent beløpet skal reduseres med (kun når det er særlige grunner). */
    prosentReduksjon: number | null;
};

/**
 * Feltstier hvor SærligeGrunner-komponenten registreres i skjemaet.
 * Brukes som `navnPrefix` slik at komponenten kan gjenbrukes på tvers av grenene.
 */
export type SærligeGrunnerNavnPrefix =
    | 'forstoEllerBurdeForstått.forsto.særligeGrunner'
    | 'forstoEllerBurdeForstått.burdeForstått.særligeGrunner'
    | 'forårsaketAvMottaker.uaktsomt.særligeGrunner'
    | 'forårsaketAvMottaker.grovtUaktsomt.særligeGrunner';

/**
 * Skjematype for vilkårsvurderingen.
 *
 * Feltene som per nå kan utledes fra GET-endepunktet (typen Vilkaar) er inkludert.
 * Felter som ennå ikke finnes i backend-kontrakten (f.eks. kreves tilbake-vurderingen)
 * kobles på når post og validering er på plass.
 */
export type VilkårsvurderingSkjemaFelter = {
    id: string;
    valg: VilkårValg;
    forstoEllerBurdeForstått: {
        forsto: {
            begrunnelse: string;
            særligeGrunner: SærligeGrunnerFelter;
        };
        burdeForstått: {
            begrunnelse: string;
            særligeGrunner: SærligeGrunnerFelter;
        };
    };
    forårsaketAvMottaker: {
        aktsomhet: AktsomhetValg;
        uaktsomt: {
            begrunnelse: string;
            særligeGrunner: SærligeGrunnerFelter;
        };
        grovtUaktsomt: {
            begrunnelse: string;
            særligeGrunner: SærligeGrunnerFelter;
        };
        forsettlig: {
            begrunnelse: string;
        };
    };
    godTro: {
        begrunnelse: string;
        beløpIBehold: BeløpIBeholdValg;
        ingenting: {
            begrunnelse: string;
        };
        hele: {
            begrunnelseIBehold: string;
        };
        deler: {
            beløpIBehold: number | null;
            begrunnelseIBehold: string;
        };
    };
};
