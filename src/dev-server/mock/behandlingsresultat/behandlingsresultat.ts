import { Vedtaksresultat, Vurdering } from '../../../frontend/kodeverk';
import { IBeregningsresultat } from '../../../frontend/typer/vedtakTyper';

const beregningsresultat_1: IBeregningsresultat = {
    vedtaksresultat: Vedtaksresultat.DELVIS_TILBAKEBETALING,
    beregningsresultatsperioder: [
        {
            periode: { fom: '2013-01-01', tom: '2017-04-30' },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORELDET,
            tilbakekrevingsbeløp: 0,
            tilbakekrevesBeløpEtterSkatt: 0,
        },
        {
            periode: { fom: '2017-05-01', tom: '2020-09-01' },
            feilutbetaltBeløp: 4000,
            vurdering: Vurdering.GROV_UAKTSOMHET,
            andelAvBeløp: 100,
            tilbakekrevingsbeløp: 4000,
            tilbakekrevesBeløpEtterSkatt: 4000,
        },
    ],
};

const beregningsresultat_2: IBeregningsresultat = {
    vedtaksresultat: Vedtaksresultat.FULL_TILBAKEBETALING,
    beregningsresultatsperioder: [
        {
            periode: {
                fom: '2013-02-01',
                tom: '2013-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2014-02-01',
                tom: '2014-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2015-02-01',
                tom: '2015-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2016-02-01',
                tom: '2016-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2017-02-01',
                tom: '2017-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2018-02-01',
                tom: '2018-11-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-03-01',
                tom: '2019-09-01',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2020-04-01',
                tom: '2020-10-01',
            },
            feilutbetaltBeløp: 4000,
            vurdering: Vurdering.FORSETT,
            andelAvBeløp: 100,
            renteprosent: 10,
            tilbakekrevingsbeløp: 4000,
            tilbakekrevesBeløpEtterSkatt: 4000,
        },
    ],
};

const beregningsresultat_3: IBeregningsresultat = {
    vedtaksresultat: Vedtaksresultat.INGEN_TILBAKEBETALING,
    beregningsresultatsperioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2018-12-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-01-01',
                tom: '2019-01-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-02-01',
                tom: '2019-02-28',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-03-01',
                tom: '2019-03-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-04-01',
                tom: '2019-04-30',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-05-01',
                tom: '2019-05-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-06-01',
                tom: '2019-06-30',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-07-01',
                tom: '2019-07-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-08-01',
                tom: '2019-08-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-09-01',
                tom: '2019-09-30',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-10-01',
                tom: '2019-10-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-11-01',
                tom: '2019-11-30',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2019-12-01',
                tom: '2019-12-31',
            },
            feilutbetaltBeløp: 5000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 5000,
            tilbakekrevesBeløpEtterSkatt: 5000,
        },
        {
            periode: {
                fom: '2020-01-01',
                tom: '2020-10-31',
            },
            feilutbetaltBeløp: 4000,
            vurdering: Vurdering.GOD_TRO,
            tilbakekrevingsbeløp: 4000,
            tilbakekrevesBeløpEtterSkatt: 4000,
        },
    ],
};

export { beregningsresultat_1, beregningsresultat_2, beregningsresultat_3 };
