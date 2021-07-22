import { Foreldelsevurdering, HendelseType, HendelseUndertype } from '../kodeverk';
import { Periode } from './feilutbetalingtyper';

export interface PeriodeFaktaStegPayload {
    periode: Periode;
    hendelsestype: HendelseType;
    hendelsesundertype: HendelseUndertype;
}

export interface FaktaStegPayload {
    '@type': string;
    begrunnelse: string;
    feilutbetaltePerioder: PeriodeFaktaStegPayload[];
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
