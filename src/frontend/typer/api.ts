import type { Behandlingresultat, Behandlingssteg, Venteårsak } from './behandling';
import type { Brevmottaker } from './Brevmottaker';
import type { Aktsomhetsvurdering, GodTro, Periode } from './tilbakekrevingstyper';
import type {
    DokumentMal,
    Foreldelsevurdering,
    HendelseType,
    HendelseUndertype,
    Vilkårsresultat,
} from '../kodeverk';
import type { Vergetype } from '../kodeverk/verge';
import type { IsoDatoString } from '../utils/dato';

export type PeriodeFaktaStegPayload = {
    periode: Periode;
    hendelsestype: HendelseType;
    hendelsesundertype: HendelseUndertype;
};

export type FaktaStegPayload = {
    '@type': string;
    begrunnelse: string;
    feilutbetaltePerioder: PeriodeFaktaStegPayload[];
};

export type PeriodeForeldelseStegPayload = {
    periode: Periode;
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
};

export type ForeldelseStegPayload = {
    '@type': string;
    foreldetPerioder: PeriodeForeldelseStegPayload[];
};

type PeriodeVilkårsvurderingStegPayload = {
    periode: Periode;
    vilkårsvurderingsresultat: Vilkårsresultat;
    begrunnelse: string;
    godTroDto: GodTro | undefined;
    aktsomhetDto: Aktsomhetsvurdering | undefined;
};

export type VilkårdsvurderingStegPayload = {
    '@type': string;
    vilkårsvurderingsperioder: PeriodeVilkårsvurderingStegPayload[];
};

export type PeriodeMedTekst = {
    periode: Periode;
    faktaAvsnitt?: string;
    foreldelseAvsnitt?: string;
    vilkårAvsnitt?: string;
    særligeGrunnerAvsnitt?: string;
    særligeGrunnerAnnetAvsnitt?: string;
};

export type Fritekstavsnitt = {
    oppsummeringstekst?: string;
    perioderMedTekst: PeriodeMedTekst[];
};

export type ForeslåVedtakStegPayload = {
    '@type': string;
    fritekstavsnitt: Fritekstavsnitt;
};

export type TotrinnsStegVurdering = {
    behandlingssteg: Behandlingssteg;
    godkjent: boolean;
    begrunnelse?: string;
};

export type FatteVedtakStegPayload = {
    '@type': string;
    totrinnsvurderinger: TotrinnsStegVurdering[];
};

export type ForhåndsvisVedtaksbrev = {
    behandlingId: string;
    oppsummeringstekst?: string;
    perioderMedTekst: PeriodeMedTekst[];
};

export type BrevPayload = {
    behandlingId: string;
    brevmalkode: DokumentMal;
    fritekst: string;
};

export type ForhåndsvisHenleggelsesbrevPayload = {
    behandlingId: string;
    fritekst: string;
};

export type ManuellBrevmottakerResponseDto = {
    id: string;
    brevmottaker: Brevmottaker;
};

export type VergeDto = {
    type: Vergetype;
    ident?: string;
    orgNr?: string;
    begrunnelse: string;
    navn: string;
};

type VergePayload = {
    type: Vergetype;
    ident?: string;
    orgNr?: string;
    begrunnelse: string;
    navn: string;
};

export type VergeStegPayload = {
    '@type': string;
    verge: VergePayload;
};

export type HenleggBehandlingPaylod = {
    behandlingsresultatstype: Behandlingresultat;
    begrunnelse: string;
    fritekst: string;
};

export type IRestSettPåVent = {
    venteårsak: Venteårsak;
    tidsfrist: IsoDatoString;
};
