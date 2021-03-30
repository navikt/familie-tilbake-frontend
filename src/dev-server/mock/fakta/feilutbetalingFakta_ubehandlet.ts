import {
    IFeilutbetalingFakta,
    Tilbakekrevingsvalg,
} from '../../../frontend/typer/feilutbetalingtyper';

const feilutbetalingFakta_ubehandlet_1: IFeilutbetalingFakta = {
    totalFeilutbetaltPeriode: {
        fom: '2013-01-01',
        tom: '2020-09-01',
    },
    totaltFeilutbetaltBeløp: 9000,
    varsletBeløp: 9300,
    revurderingsvedtaksdato: '2020-12-05',
    faktainfo: {
        revurderingsårsak: 'Ny søknad',
        revurderingsresultat: 'Opphør av ytelsen',
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_MED_VARSEL,
        konsekvensForYtelser: ['Opphør av ytelsen', 'Ytelsen redusert'],
    },
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2017-04-30',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2017-05-01',
                tom: '2020-09-01',
            },
            feilutbetaltBeløp: 4000,
        },
    ],
};

const feilutbetalingFakta_ubehandlet_2: IFeilutbetalingFakta = {
    totalFeilutbetaltPeriode: { fom: '2013-02-01', tom: '2020-09-01' },
    totaltFeilutbetaltBeløp: 39000,
    varsletBeløp: 43000,
    revurderingsvedtaksdato: '2020-12-05',
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-02-01',
                tom: '2013-11-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2014-02-01',
                tom: '2014-11-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2015-02-01',
                tom: '2015-11-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2016-02-01',
                tom: '2016-11-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2017-02-01',
                tom: '2017-11-01',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2018-02-01',
                tom: '2018-11-01',
            },
            feilutbetaltBeløp: 5000,
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

const feilutbetalingFakta_ubehandlet_3: IFeilutbetalingFakta = {
    totalFeilutbetaltPeriode: {
        fom: '2013-01-01',
        tom: '2020-10-31',
    },
    totaltFeilutbetaltBeløp: 39000,
    varsletBeløp: 43000,
    revurderingsvedtaksdato: '2020-12-05',
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2018-12-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-01-01',
                tom: '2019-01-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-02-01',
                tom: '2019-02-28',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-03-01',
                tom: '2019-03-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-04-01',
                tom: '2019-04-30',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-05-01',
                tom: '2019-05-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-06-01',
                tom: '2019-06-30',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-07-01',
                tom: '2019-07-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-08-01',
                tom: '2019-08-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-09-01',
                tom: '2019-09-30',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-10-01',
                tom: '2019-10-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-11-01',
                tom: '2019-11-30',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2019-12-01',
                tom: '2019-12-31',
            },
            feilutbetaltBeløp: 5000,
        },
        {
            periode: {
                fom: '2020-01-01',
                tom: '2020-10-31',
            },
            feilutbetaltBeløp: 4000,
        },
    ],
};

const feilutbetalingFakta_ubehandlet_4: IFeilutbetalingFakta = {
    totalFeilutbetaltPeriode: { fom: '2020-04-01', tom: '2020-08-31' },
    totaltFeilutbetaltBeløp: 4000,
    varsletBeløp: 4000,
    revurderingsvedtaksdato: '2020-12-05',
    faktainfo: {
        revurderingsårsak: 'Ny søknad',
        revurderingsresultat: 'Opphør av ytelsen',
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
        konsekvensForYtelser: ['Opphør av ytelsen', 'Ytelsen redusert'],
    },
    feilutbetaltePerioder: [
        {
            periode: { fom: '2019-04-01', tom: '2019-05-31' },
            feilutbetaltBeløp: 2000,
        },
        {
            periode: { fom: '2019-07-01', tom: '2019-08-31' },
            feilutbetaltBeløp: 2000,
        },
    ],
};

export {
    feilutbetalingFakta_ubehandlet_1,
    feilutbetalingFakta_ubehandlet_2,
    feilutbetalingFakta_ubehandlet_3,
    feilutbetalingFakta_ubehandlet_4,
};
