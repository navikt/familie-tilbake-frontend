import type { FaktaPeriode, VurderingAvBrukersUttalelse } from './tilbakekrevingstyper';
import type { Avsnittstype, Underavsnittstype, Vedtaksresultat, Vurdering } from '~/kodeverk';

export interface BeregningsresultatPeriode extends FaktaPeriode {
    vurdering: Vurdering;
    andelAvBeløp?: number;
    renteprosent?: number;
    tilbakekrevingsbeløp: number;
    tilbakekrevesBeløpEtterSkatt: number;
}

export type Beregningsresultat = {
    beregningsresultatsperioder: BeregningsresultatPeriode[];
    vedtaksresultat: Vedtaksresultat;
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
};

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
