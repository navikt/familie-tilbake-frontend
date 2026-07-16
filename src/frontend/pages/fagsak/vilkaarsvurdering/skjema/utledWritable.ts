import type {
    AktsomhetWritable,
    BelopIBeholdWritable,
    ForstaaelseWritable,
    MomentWritable,
    ReduksjonWritable,
    SaerligeGrunnerWritable,
    UnnlatelseWritable,
    VilkaarsvurderingValgWritable,
    VilkaarsvurderingWritable,
} from '@/generated-new';
import type {
    ReduksjonFelter,
    SærligeGrunnerFelter,
    UnnlatelseFelter,
    VilkårsvurderingSkjemaFelter,
} from './schema';

const tilMomenter = (verdier: string[]): MomentWritable[] => verdier.map(moment => ({ moment }));

const tilAnnetBegrunnelse = (verdi: string): string | null => (verdi.trim() === '' ? null : verdi);

const utledSærligeGrunnerWritable = (felter: SærligeGrunnerFelter): SaerligeGrunnerWritable => {
    if (felter.erDetSaerligeGrunner === 'ja') {
        return {
            erDetSaerligeGrunner: 'ja',
            særligeGrunnerFor: tilMomenter(felter.jaSærligeGrunner.særligeGrunnerFor),
            prosentReduksjon: felter.jaSærligeGrunner.prosentReduksjon ?? 0,
            begrunnelse: felter.jaSærligeGrunner.begrunnelse,
            annetBegrunnelse: tilAnnetBegrunnelse(felter.jaSærligeGrunner.annetBegrunnelse),
        };
    }
    return {
        erDetSaerligeGrunner: 'nei',
        særligeGrunnerMot: tilMomenter(felter.neiSærligeGrunner.særligeGrunnerMot),
        begrunnelse: felter.neiSærligeGrunner.begrunnelse,
        annetBegrunnelse: tilAnnetBegrunnelse(felter.neiSærligeGrunner.annetBegrunnelse),
    };
};

const utledReduksjonWritable = (felter: ReduksjonFelter): ReduksjonWritable => {
    if (felter.reduksjon === 'skalReduseres') {
        return {
            reduksjon: 'skalReduseres',
            beløp: felter.skalReduseres.beløp ?? 0,
            relevans: tilMomenter(felter.skalReduseres.relevans),
            annetBegrunnelse: tilAnnetBegrunnelse(felter.skalReduseres.annetBegrunnelse),
            begrunnelse: felter.skalReduseres.begrunnelse,
        };
    }
    return {
        reduksjon: 'skalIkkeReduseres',
        relevans: tilMomenter(felter.skalIkkeReduseres.relevans),
        annetBegrunnelse: tilAnnetBegrunnelse(felter.skalIkkeReduseres.annetBegrunnelse),
        begrunnelse: felter.skalIkkeReduseres.begrunnelse,
    };
};

const utledUnnlatelseWritable = (felter: UnnlatelseFelter): UnnlatelseWritable => {
    switch (felter.unnlatelse) {
        case 'skalUnnlates':
            return {
                unnlatelse: 'skalUnnlates',
                begrunnelse: felter.skalUnnlates.begrunnelse,
            };
        case 'skalIkkeUnnlates':
            return {
                unnlatelse: 'skalIkkeUnnlates',
                begrunnelse: felter.skalIkkeUnnlates.begrunnelse,
                erDetSærligeGrunner: utledSærligeGrunnerWritable(
                    felter.skalIkkeUnnlates.erDetSærligeGrunner
                ),
            };
        default:
            return {
                unnlatelse: 'ikkeAktuelt',
                erDetSærligeGrunner: utledSærligeGrunnerWritable(
                    felter.ikkeAktuelt.erDetSærligeGrunner
                ),
            };
    }
};

const utledValgWritable = (felter: VilkårsvurderingSkjemaFelter): VilkaarsvurderingValgWritable => {
    switch (felter.valg) {
        case 'forsto_eller_burde_forstått': {
            const { forstoEllerBurdeForstått } = felter;
            const forståelse: ForstaaelseWritable =
                forstoEllerBurdeForstått.forståelse === 'forsto'
                    ? {
                          forståelse: 'forsto',
                          begrunnelse: forstoEllerBurdeForstått.forsto.begrunnelse,
                          unnlatelse: utledUnnlatelseWritable(
                              forstoEllerBurdeForstått.forsto.unnlatelse
                          ),
                      }
                    : {
                          forståelse: 'burdeForstått',
                          begrunnelse: forstoEllerBurdeForstått.burdeForstått.begrunnelse,
                          unnlatelse: utledUnnlatelseWritable(
                              forstoEllerBurdeForstått.burdeForstått.unnlatelse
                          ),
                      };
            return { vurdering: 'forsto_eller_burde_forstått', forståelse };
        }
        case 'forårsaket_av_mottaker': {
            const { forårsaketAvMottaker } = felter;
            let aktsomhet: AktsomhetWritable;
            switch (forårsaketAvMottaker.aktsomhet) {
                case 'uaktsomt':
                    aktsomhet = {
                        aktsomhet: 'uaktsomt',
                        begrunnelse: forårsaketAvMottaker.uaktsomt.begrunnelse,
                        unnlatelse: utledUnnlatelseWritable(
                            forårsaketAvMottaker.uaktsomt.unnlatelse
                        ),
                    };
                    break;
                case 'grovtUaktsomt':
                    aktsomhet = {
                        aktsomhet: 'grovtUaktsomt',
                        begrunnelse: forårsaketAvMottaker.grovtUaktsomt.begrunnelse,
                        erDetSærligeGrunner: utledSærligeGrunnerWritable(
                            forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner
                        ),
                    };
                    break;
                default:
                    aktsomhet = {
                        aktsomhet: 'forsettlig',
                        begrunnelse: forårsaketAvMottaker.forsettlig.begrunnelse,
                    };
            }
            return { vurdering: 'forårsaket_av_mottaker', aktsomhet };
        }
        case 'god_tro': {
            const { godTro } = felter;
            let beløpIBehold: BelopIBeholdWritable;
            switch (godTro.beløpIBehold) {
                case 'ingenting':
                    beløpIBehold = {
                        belopIBehold: 'ingenting',
                        begrunnelse: godTro.ingenting.begrunnelse,
                    };
                    break;
                case 'hele':
                    beløpIBehold = {
                        belopIBehold: 'hele',
                        begrunnelse: godTro.hele.begrunnelse,
                        reduksjon: utledReduksjonWritable(godTro.hele),
                    };
                    break;
                default:
                    beløpIBehold = {
                        belopIBehold: 'deler',
                        beløp: godTro.deler.beløp ?? 0,
                        begrunnelse: godTro.deler.begrunnelse,
                        reduksjon: utledReduksjonWritable(godTro.deler),
                    };
            }
            return { vurdering: 'god_tro', begrunnelse: godTro.begrunnelse, beløpIBehold };
        }
        default:
            throw new Error('Kan ikke lagre en vilkårsvurdering uten et valg');
    }
};

/**
 * Bygger request-body (`VilkaarsvurderingWritable`) fra skjemafeltene. Kun den
 * aktive diskriminerte grenen tas med. Forutsetter at feltene er validert.
 */
export const utledWritable = (felter: VilkårsvurderingSkjemaFelter): VilkaarsvurderingWritable => ({
    id: felter.id,
    valg: utledValgWritable(felter),
});
