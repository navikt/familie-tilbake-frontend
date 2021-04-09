import { Foreldelsevurdering } from '../../../frontend/kodeverk';
import { IFeilutbetalingForeldelse } from '../../../frontend/typer/feilutbetalingtyper';

const feilutbetalingForeldelse_behandlet_1: IFeilutbetalingForeldelse = {
    foreldetPerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2017-04-30',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
            begrunnelse: 'Dette er ein mock-begrunnelse',
            foreldelsesfrist: '2018-08-01',
        },
        {
            periode: {
                fom: '2017-05-01',
                tom: '2020-09-01',
            },
            feilutbetaltBeløp: 4000,
            foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
            begrunnelse: 'Dette er ein mock-begrunnelse',
            foreldelsesfrist: '2019-06-01',
            oppdagelsesdato: '2020-11-01',
        },
    ],
};

const feilutbetalingForeldelse_behandlet_2: IFeilutbetalingForeldelse = {
    foreldetPerioder: [
        {
            periode: {
                fom: '2013-02-01',
                tom: '2013-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
            begrunnelse: 'Dette er ein mock-begrunnelse per 1',
            foreldelsesfrist: '2017-01-01',
        },
        {
            periode: {
                fom: '2014-02-01',
                tom: '2014-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
            begrunnelse: 'Dette er ein mock-begrunnelse per 2',
            foreldelsesfrist: '2017-01-10',
        },
        {
            periode: {
                fom: '2015-02-01',
                tom: '2015-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
            begrunnelse: 'Dette er ein mock-begrunnelse per 3',
            foreldelsesfrist: '2017-01-01',
            oppdagelsesdato: '2020-11-01',
        },
        {
            periode: {
                fom: '2016-02-01',
                tom: '2016-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
            begrunnelse: 'Dette er ein mock-begrunnelse per 4',
            foreldelsesfrist: '2017-01-10',
            oppdagelsesdato: '2020-11-10',
        },
        {
            periode: {
                fom: '2017-02-01',
                tom: '2017-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.IKKE_FORELDET,
            begrunnelse: 'Dette er ein mock-begrunnelse per 5',
        },
        {
            periode: {
                fom: '2018-02-01',
                tom: '2018-11-01',
            },
            feilutbetaltBeløp: 5000,
            foreldelsesvurderingstype: Foreldelsevurdering.IKKE_FORELDET,
            begrunnelse: 'Dette er ein mock-begrunnelse per 6',
        },
        {
            periode: {
                fom: '2019-03-01',
                tom: '2019-09-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2020-04-01',
                tom: '2020-10-01',
            },
            feilutbetaltBeløp: 4000,
        },
    ],
};

export { feilutbetalingForeldelse_behandlet_1, feilutbetalingForeldelse_behandlet_2 };
