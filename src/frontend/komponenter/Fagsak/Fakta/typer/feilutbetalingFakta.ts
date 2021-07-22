import { HendelseType, HendelseUndertype } from '../../../../kodeverk';
import { Periode } from '../../../../typer/feilutbetalingtyper';

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
}

export interface Feilmelding {
    gjelderBegrunnelse: boolean;
    melding?: string;
    periode?: number;
    gjelderHendelsetype?: boolean;
    gjelderHendelseundertype?: boolean;
}
