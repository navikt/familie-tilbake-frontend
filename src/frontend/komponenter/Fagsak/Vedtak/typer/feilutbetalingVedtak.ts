import { Avsnittstype, Underavsnittstype } from '../../../../kodeverk';
import { Periode } from '../../../../typer/feilutbetalingtyper';

export interface UnderavsnittSkjemaData {
    index: string;
    underavsnittstype?: Underavsnittstype;
    brødtekst?: string;
    fritekst?: string;
    fritekstTillatt: boolean;
    overskrift?: string;
    fritekstPåkrevet: boolean;
    harFeil?: boolean;
    feilmelding?: string;
}

export interface AvsnittSkjemaData {
    index: string;
    avsnittstype: Avsnittstype;
    fom?: string;
    tom?: string;
    overskrift?: string;
    underavsnittsliste: UnderavsnittSkjemaData[];
}

export interface PeriodeMedTekst {
    periode: Periode;
    faktaAvsnitt?: string;
    foreldelseAvsnitt?: string;
    vilkårAvsnitt?: string;
    særligeGrunnerAvsnitt?: string;
    særligeGrunnerAnnetAvsnitt?: string;
}

export interface ForhåndsvisVedtaksbrev {
    behandlingId: string;
    oppsummeringstekst?: string;
    perioderMedTekst: PeriodeMedTekst[];
}

export interface ForeslåVedtakStegPayload {
    '@type': string;
    fritekstavsnitt: {
        oppsummeringstekst?: string;
        perioderMedTekst: PeriodeMedTekst[];
    };
}
