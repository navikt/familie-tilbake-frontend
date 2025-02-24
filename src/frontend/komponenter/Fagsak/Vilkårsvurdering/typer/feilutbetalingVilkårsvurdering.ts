import type { HendelseType, Vilkårsresultat } from '../../../../kodeverk';
import type {
    Aktsomhetsvurdering,
    GodTro,
    ReduserteBeløpInfo,
    YtelseInfo,
} from '../../../../typer/feilutbetalingtyper';
import type { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';

interface VilkårsresultatInfoSkjemaData {
    vilkårsvurderingsresultat?: Vilkårsresultat;
    godTro?: GodTro;
    aktsomhet?: Aktsomhetsvurdering;
}

export interface VilkårsvurderingPeriodeSkjemaData extends IPeriodeSkjemaData {
    hendelsestype: HendelseType;
    aktiviteter?: YtelseInfo[];
    reduserteBeløper?: ReduserteBeløpInfo[];
    foreldet: boolean;
    begrunnelse?: string;
    vilkårsvurderingsresultatInfo?: VilkårsresultatInfoSkjemaData;
}
