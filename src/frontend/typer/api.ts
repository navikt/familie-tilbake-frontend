import { Foreldelsevurdering, HendelseType, HendelseUndertype, Vilkårsresultat } from '../kodeverk';
import { Aktsomhetsvurdering, GodTro, Periode } from './feilutbetalingtyper';

export interface PeriodeFaktaStegPayload {
    periode: Periode;
    hendelsestype: HendelseType;
    hendelsesundertype: HendelseUndertype;
}

export interface FaktaStegPayload {
    '@type': string;
    begrunnelse: string;
    feilutbetaltePerioder: PeriodeFaktaStegPayload[];
}

export interface PeriodeForeldelseStegPayload {
    periode: Periode;
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
}

export interface ForeldelseStegPayload {
    '@type': string;
    foreldetPerioder: PeriodeForeldelseStegPayload[];
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
