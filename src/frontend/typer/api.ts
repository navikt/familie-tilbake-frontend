import {
    DokumentMal,
    Foreldelsevurdering,
    HendelseType,
    HendelseUndertype,
    Vilkårsresultat,
} from '../kodeverk';
import { Behandlingssteg } from './behandling';
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

export interface PeriodeMedTekst {
    periode: Periode;
    faktaAvsnitt?: string;
    foreldelseAvsnitt?: string;
    vilkårAvsnitt?: string;
    særligeGrunnerAvsnitt?: string;
    særligeGrunnerAnnetAvsnitt?: string;
}

export interface ForeslåVedtakStegPayload {
    '@type': string;
    fritekstavsnitt: {
        oppsummeringstekst?: string;
        perioderMedTekst: PeriodeMedTekst[];
    };
}

export interface TotrinnsStegVurdering {
    behandlingssteg: Behandlingssteg;
    godkjent: boolean;
    begrunnelse?: string;
}

export interface FatteVedtakStegPayload {
    '@type': string;
    totrinnsvurderinger: TotrinnsStegVurdering[];
}

export interface ForhåndsvisVedtaksbrev {
    behandlingId: string;
    oppsummeringstekst?: string;
    perioderMedTekst: PeriodeMedTekst[];
}

export interface BrevPayload {
    behandlingId: string;
    brevmalkode: DokumentMal;
    fritekst: string;
}

export interface ForhåndsvisHenleggelsesbrevPayload {
    behandlingId: string;
    fritekst: string;
}
