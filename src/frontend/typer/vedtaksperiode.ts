import type { FamilieIsoDate } from '../utils/kalender';
import { YtelseType } from './beregning';
import type { IGrunnlagPerson } from './person';
import type { VedtakBegrunnelse, VedtakBegrunnelseType } from './vedtak';

export interface IVedtaksperiodeMedBegrunnelser {
    id: number;
    fom?: FamilieIsoDate;
    tom?: FamilieIsoDate;
    type: Vedtaksperiodetype;
    begrunnelser: IRestVedtaksbegrunnelse[];
    fritekster: string[];
    gyldigeBegrunnelser: VedtakBegrunnelse[];
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

export interface IRestVedtaksbegrunnelse {
    standardbegrunnelse: VedtakBegrunnelse;
    vedtakBegrunnelseType: VedtakBegrunnelseType;
}
export enum Vedtaksperiodetype {
    UTBETALING = 'UTBETALING',
    UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING = 'UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    FORTSATT_INNVILGET = 'FORTSATT_INNVILGET',
    ENDRET_UTBETALING = 'ENDRET_UTBETALING',
}
export interface IUtbetalingsperiodeDetalj {
    person: IGrunnlagPerson;
    ytelseType: YtelseType;
    utbetaltPerMnd: number;
    erPåvirketAvEndring: boolean;
}
