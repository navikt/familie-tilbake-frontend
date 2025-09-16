import type { HendelseType, Vilkårsresultat } from '../../../../kodeverk';
import type { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import type {
    Aktsomhetsvurdering,
    GodTro,
    YtelseInfo,
} from '../../../../typer/tilbakekrevingstyper';

interface VilkårsresultatInfoSkjemaData {
    vilkårsvurderingsresultat?: Vilkårsresultat;
    godTro?: GodTro;
    aktsomhet?: Aktsomhetsvurdering;
}

export interface VilkårsvurderingPeriodeSkjemaData extends IPeriodeSkjemaData {
    hendelsestype: HendelseType;
    aktiviteter?: YtelseInfo[];
    foreldet: boolean;
    begrunnelse?: string;
    vilkårsvurderingsresultatInfo?: VilkårsresultatInfoSkjemaData;
}
