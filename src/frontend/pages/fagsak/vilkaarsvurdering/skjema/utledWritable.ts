import type {
    Aktsomhet,
    BelopIBehold,
    Forstaaelse,
    Moment,
    PeriodeInfo,
    Reduksjon,
    SaerligeGrunner,
    Unnlatelse,
    Vilkaarsvurdering,
    VilkaarsvurderingValg,
} from '@/generated-new';
import type {
    ReduksjonFelter,
    SærligeGrunnerFelter,
    UnnlatelseFelter,
    VilkårsvurderingSkjemaFelter,
} from './schema';

/**
 * TODO: Må fikses i backend – dette er en midlertidig workaround.
 *
 * POST-endepunktet for vilkårsvurdering tar hele `Vilkaarsvurdering`-modellen som
 * request body. Feltene under er markert `readOnly` i kontrakten – altså rene
 * lesedata backend selv eier – men de er fortsatt `required` i schemaet backend
 * deserialiserer mot. Utelater vi dem svarer backend 500.
 *
 * Den genererte `VilkaarsvurderingWritable` (kun `id` + `valg`) er derfor riktig
 * slik den er nå; det er backend som må ta imot en egen skrivemodell (slik
 * vedtaksbrev gjør med `...Update`/`...UpdateItem`). Feltene vi må sende likevel:
 *
 *   - `fom`, `tom` og `delbarePerioder` på rota
 *   - `beskrivelse` på hvert `Moment` (særligeGrunnerFor/-Mot og relevans)
 */
type PåkrevdForBackend = {
    fom: string;
    tom: string;
    delbarePerioder: readonly PeriodeInfo[];
    momenter: readonly Moment[];
};

type MomentMapper = (verdier: string[]) => Moment[];

const lagMomentMapper = (momenter: readonly Moment[]): MomentMapper => {
    const beskrivelser = new Map(
        momenter.map(({ moment, beskrivelse }) => [moment, beskrivelse] as const)
    );
    return (verdier: string[]): Moment[] =>
        verdier.map(moment => ({ moment, beskrivelse: beskrivelser.get(moment) ?? '' }));
};

const tilAnnetBegrunnelse = (verdi: string): string | null => (verdi.trim() === '' ? null : verdi);

const utledSærligeGrunner = (
    felter: SærligeGrunnerFelter,
    tilMomenter: MomentMapper
): SaerligeGrunner => {
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

const utledReduksjon = (felter: ReduksjonFelter, tilMomenter: MomentMapper): Reduksjon => {
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

const utledUnnlatelse = (felter: UnnlatelseFelter, tilMomenter: MomentMapper): Unnlatelse => {
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
                erDetSærligeGrunner: utledSærligeGrunner(
                    felter.skalIkkeUnnlates.erDetSærligeGrunner,
                    tilMomenter
                ),
            };
        default:
            return {
                unnlatelse: 'ikkeAktuelt',
                erDetSærligeGrunner: utledSærligeGrunner(
                    felter.ikkeAktuelt.erDetSærligeGrunner,
                    tilMomenter
                ),
            };
    }
};

const utledValg = (
    felter: VilkårsvurderingSkjemaFelter,
    tilMomenter: MomentMapper
): VilkaarsvurderingValg => {
    switch (felter.valg) {
        case 'forsto_eller_burde_forstått': {
            const { forstoEllerBurdeForstått } = felter;
            const forståelse: Forstaaelse =
                forstoEllerBurdeForstått.forståelse === 'forsto'
                    ? {
                          forståelse: 'forsto',
                          begrunnelse: forstoEllerBurdeForstått.forsto.begrunnelse,
                          unnlatelse: utledUnnlatelse(
                              forstoEllerBurdeForstått.forsto.unnlatelse,
                              tilMomenter
                          ),
                      }
                    : {
                          forståelse: 'burdeForstått',
                          begrunnelse: forstoEllerBurdeForstått.burdeForstått.begrunnelse,
                          unnlatelse: utledUnnlatelse(
                              forstoEllerBurdeForstått.burdeForstått.unnlatelse,
                              tilMomenter
                          ),
                      };
            return { vurdering: 'forsto_eller_burde_forstått', forståelse };
        }
        case 'forårsaket_av_mottaker': {
            const { forårsaketAvMottaker } = felter;
            let aktsomhet: Aktsomhet;
            switch (forårsaketAvMottaker.aktsomhet) {
                case 'uaktsomt':
                    aktsomhet = {
                        aktsomhet: 'uaktsomt',
                        begrunnelse: forårsaketAvMottaker.uaktsomt.begrunnelse,
                        unnlatelse: utledUnnlatelse(
                            forårsaketAvMottaker.uaktsomt.unnlatelse,
                            tilMomenter
                        ),
                    };
                    break;
                case 'grovtUaktsomt':
                    aktsomhet = {
                        aktsomhet: 'grovtUaktsomt',
                        begrunnelse: forårsaketAvMottaker.grovtUaktsomt.begrunnelse,
                        erDetSærligeGrunner: utledSærligeGrunner(
                            forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner,
                            tilMomenter
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
            let beløpIBehold: BelopIBehold;
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
                        reduksjon: utledReduksjon(godTro.hele, tilMomenter),
                    };
                    break;
                default:
                    beløpIBehold = {
                        belopIBehold: 'deler',
                        beløp: godTro.deler.beløp ?? 0,
                        begrunnelse: godTro.deler.begrunnelse,
                        reduksjon: utledReduksjon(godTro.deler, tilMomenter),
                    };
            }
            return { vurdering: 'god_tro', begrunnelse: godTro.begrunnelse, beløpIBehold };
        }
        default:
            throw new Error('Kan ikke lagre en vilkårsvurdering uten et valg');
    }
};

/**
 * Bygger request-body fra skjemafeltene. Kun den aktive diskriminerte grenen tas
 * med. Forutsetter at feltene er validert.
 *
 * `påkrevdForBackend` er lesedata som egentlig ikke hører hjemme i en skrivemodell –
 * se kommentaren på `PåkrevdForBackend`.
 */
export const utledWritable = (
    felter: VilkårsvurderingSkjemaFelter,
    påkrevdForBackend: PåkrevdForBackend
): Vilkaarsvurdering => ({
    id: felter.id,
    valg: utledValg(felter, lagMomentMapper(påkrevdForBackend.momenter)),
    fom: påkrevdForBackend.fom,
    tom: påkrevdForBackend.tom,
    delbarePerioder: [...påkrevdForBackend.delbarePerioder],
});
