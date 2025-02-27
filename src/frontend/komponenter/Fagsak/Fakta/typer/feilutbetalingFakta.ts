import type { HendelseType, HendelseUndertype } from '../../../../kodeverk';
import type { VurderingAvBrukersUttalelse, Periode } from '../../../../typer/feilutbetalingtyper';

export interface FaktaPeriodeSkjemaData {
    index: number;
    feilutbetaltBeløp: number;
    periode: Periode;
    hendelsestype?: HendelseType | null;
    hendelsesundertype?: HendelseUndertype;
}

export interface FaktaSkjemaData {
    begrunnelse?: string;
    perioder: FaktaPeriodeSkjemaData[];
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
}

export interface Feilmelding {
    gjelderBegrunnelse: boolean;
    gjelderBeskrivelseBrukerHarUttaltSeg?: boolean;
    melding?: string;
    periode?: number;
    gjelderHendelsetype?: boolean;
    gjelderHendelseundertype?: boolean;
    gjelderBrukerHarUttaltSeg?: boolean;
}
