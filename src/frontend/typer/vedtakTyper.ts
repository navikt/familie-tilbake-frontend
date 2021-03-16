import { Avsnittstype, Underavsnittstype, Vedtaksresultat, Vurdering } from '../kodeverk/';
import { FeilutbetalingPeriode } from './feilutbetalingtyper';

export type BeregningsresultatPeriode = {
    vurdering: Vurdering;
    andelAvBeløp?: number;
    renterProsent?: number;
    tilbakekrevingBeløp: number;
    tilbakekrevingBeløpEtterSkatt: number;
} & FeilutbetalingPeriode;

export interface IBeregningsresultat {
    perioder: BeregningsresultatPeriode[];
    vedtaksresultat: Vedtaksresultat;
}

export type VedtaksbrevUnderavsnitt = {
    underavsnittstype?: Underavsnittstype;
    brødtekst?: string;
    fritekst?: string;
    fritekstTillatt: boolean;
    overskrift?: string;
    fritekstPåkrevet: boolean;
};

export type VedtaksbrevAvsnitt = {
    avsnittstype: Avsnittstype;
    fom?: string;
    tom?: string;
    overskrift?: string;
    underavsnittsliste: VedtaksbrevUnderavsnitt[];
};

export interface IVedtaksbrev {
    avsnittsliste: VedtaksbrevAvsnitt[];
}
