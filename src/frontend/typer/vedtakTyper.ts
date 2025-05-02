import type { FeilutbetalingPeriode, VurderingAvBrukersUttalelse } from './feilutbetalingtyper';
import type { Avsnittstype, Underavsnittstype, Vedtaksresultat, Vurdering } from '../kodeverk/';

export interface BeregningsresultatPeriode extends FeilutbetalingPeriode {
    vurdering: Vurdering;
    andelAvBeløp?: number;
    renteprosent?: number;
    tilbakekrevingsbeløp: number;
    tilbakekrevesBeløpEtterSkatt: number;
}

export interface IBeregningsresultat {
    beregningsresultatsperioder: BeregningsresultatPeriode[];
    vedtaksresultat: Vedtaksresultat;
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
}

type VedtaksbrevUnderavsnitt = {
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
