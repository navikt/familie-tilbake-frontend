import { Foreldelsevurdering } from '../../../../kodeverk';
import { Periode } from '../../../../typer/feilutbetalingtyper';

export interface ForeldelsePeriodeSkjemeData {
    index: string;
    feilutbetaltBeløp: number;
    periode: Periode;
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
    erSplittet?: boolean | false;
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
