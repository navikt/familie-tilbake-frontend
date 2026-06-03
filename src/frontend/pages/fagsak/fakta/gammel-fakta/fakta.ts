import type { HendelseType, HendelseUndertype } from '@/kodeverk';
import type { Periode, VurderingAvBrukersUttalelse } from '@/typer/tilbakekrevingstyper';

export type FaktaPeriodeSkjemaData = {
    index: number;
    feilutbetaltBeløp: number;
    periode: Periode;
    hendelsestype?: HendelseType | null;
    hendelsesundertype?: HendelseUndertype;
};

export type FaktaSkjemaData = {
    begrunnelse?: string;
    perioder: FaktaPeriodeSkjemaData[];
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
};

export type Feilmelding = {
    gjelderBegrunnelse: boolean;
    gjelderBeskrivelseBrukerHarUttaltSeg?: boolean;
    melding?: string;
    periode?: number;
    gjelderHendelsetype?: boolean;
    gjelderHendelseundertype?: boolean;
    gjelderBrukerHarUttaltSeg?: boolean;
};
