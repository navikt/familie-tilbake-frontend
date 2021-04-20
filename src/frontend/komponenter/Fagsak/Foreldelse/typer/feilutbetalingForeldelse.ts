import { Foreldelsevurdering } from '../../../../kodeverk';
import { Periode } from '../../../../typer/feilutbetalingtyper';
import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';

export interface ForeldelsePeriodeSkjemeData extends IPeriodeSkjemaData {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
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
