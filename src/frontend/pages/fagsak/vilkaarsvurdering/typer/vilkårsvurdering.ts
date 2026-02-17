import type { HendelseType, Vilkårsresultat } from '../../../../kodeverk';
import type { PeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import type {
    Aktsomhetsvurdering,
    GodTro,
    YtelseInfo,
} from '../../../../typer/tilbakekrevingstyper';

type VilkårsresultatInfoSkjemaData = {
    vilkårsvurderingsresultat?: Vilkårsresultat;
    godTro?: GodTro;
    aktsomhet?: Aktsomhetsvurdering;
};

export interface VilkårsvurderingPeriodeSkjemaData extends PeriodeSkjemaData {
    hendelsestype: HendelseType;
    aktiviteter?: YtelseInfo[];
    foreldet: boolean;
    begrunnelse?: string;
    vilkårsvurderingsresultatInfo?: VilkårsresultatInfoSkjemaData;
}
