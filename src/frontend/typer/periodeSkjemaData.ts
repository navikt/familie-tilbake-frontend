import { Periode } from './feilutbetalingtyper';

export interface IPeriodeSkjemaData {
    index: string;
    feilutbetaltBeløp: number;
    periode: Periode;
    erSplittet?: boolean | false;
}
