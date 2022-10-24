import { HendelseType, HendelseUndertype } from '../../../../kodeverk';
import { Periode } from '../../../../typer/feilutbetalingtyper';

export interface FaktaPeriodeSkjemaData {
    index: string;
    feilutbetaltBeløp: number;
    periode: Periode;
    erSplittet?: boolean | false;
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
    periode?: string;
    gjelderHendelsetype?: boolean;
    gjelderHendelseundertype?: boolean;
}
