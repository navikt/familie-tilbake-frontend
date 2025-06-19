import type { Periode } from './feilutbetalingtyper';

export interface IPeriodeSkjemaData {
    index: string;
    feilutbetaltBeløp: number;
    periode: Periode;
    erSplittet?: boolean | false;
}

export enum ClassNamePeriodeStatus {
    Behandlet = 'behandlet',
    Ubehandlet = 'ubehandlet',
    Avvist = 'avvist',
}
