import { HendelseType, Vilkårsresultat } from '../../../../kodeverk';
import {
    Aktsomhetsvurdering,
    GodTro,
    Periode,
    ReduserteBeløpInfo,
    YtelseInfo,
} from '../../../../typer/feilutbetalingtyper';
import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';

export interface VilkårsresultatInfoSkjemaData {
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

export interface PeriodeVilkårsvurderingStegPayload {
    periode: Periode;
    vilkårsvurderingsresultat: Vilkårsresultat;
    begrunnelse: string;
    godTroDto: GodTro;
    aktsomhetDto: Aktsomhetsvurdering;
}

export interface VilkårdsvurderingStegPayload {
    '@type': string;
    vilkårsvurderingsperioder: PeriodeVilkårsvurderingStegPayload[];
}
