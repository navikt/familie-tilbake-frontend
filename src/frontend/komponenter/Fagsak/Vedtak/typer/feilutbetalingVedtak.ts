import { Avsnittstype, Underavsnittstype } from '../../../../kodeverk';

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
