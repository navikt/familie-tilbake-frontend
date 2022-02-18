import { HendelseType } from '../../../frontend/kodeverk';
import { IFeilutbetalingVilkårsvurdering } from '../../../frontend/typer/feilutbetalingtyper';

const feilutbetalingVilkårsvurdering_ubehandlet_1 = (
    hendelsestype: HendelseType
): IFeilutbetalingVilkårsvurdering => {
    return {
        rettsgebyr: 1500,
        perioder: [
            {
                periode: {
                    fom: '2013-01-01',
                    tom: '2017-04-30',
                },
                aktiviteter: [
                    { aktivitet: 'Arbeidstaker', beløp: 2000 },
                    { aktivitet: 'Frilanser', beløp: 3000 },
                ],
                reduserteBeløper: [
                    { trekk: false, beløp: 2000 },
                    { trekk: true, beløp: 3000 },
                ],
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2017-05-01',
                    tom: '2020-09-01',
                },
                aktiviteter: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                reduserteBeløper: [{ trekk: false, beløp: 4000 }],
                feilutbetaltBeløp: 4000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
        ],
    };
};

const feilutbetalingVilkårsvurdering_ubehandlet_2 = (
    hendelsestype: HendelseType
): IFeilutbetalingVilkårsvurdering => {
    return {
        rettsgebyr: 1300,
        perioder: [
            {
                periode: {
                    fom: '2013-02-01',
                    tom: '2013-11-01',
                },
                aktiviteter: [
                    { aktivitet: 'Arbeidstaker', beløp: 2000 },
                    { aktivitet: 'Frilanser', beløp: 3000 },
                ],
                reduserteBeløper: [
                    { trekk: false, beløp: 2000 },
                    { trekk: true, beløp: 3000 },
                ],
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2014-02-01',
                    tom: '2014-11-01',
                },
                aktiviteter: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2015-02-01',
                    tom: '2015-11-01',
                },
                aktiviteter: [
                    { aktivitet: 'Arbeidstaker', beløp: 2000 },
                    { aktivitet: 'Frilanser', beløp: 3000 },
                ],
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2016-02-01',
                    tom: '2016-11-01',
                },
                aktiviteter: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2017-02-01',
                    tom: '2017-11-01',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2018-02-01',
                    tom: '2018-11-01',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-03-01',
                    tom: '2019-09-01',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2020-04-01',
                    tom: '2020-10-01',
                },
                feilutbetaltBeløp: 4000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
        ],
    };
};

const feilutbetalingVilkårsvurdering_ubehandlet_3 = (
    hendelsestype: HendelseType
): IFeilutbetalingVilkårsvurdering => {
    return {
        rettsgebyr: 1500,
        perioder: [
            {
                periode: {
                    fom: '2013-01-01',
                    tom: '2018-12-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-01-01',
                    tom: '2019-01-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-02-01',
                    tom: '2019-02-28',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-03-01',
                    tom: '2019-03-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-04-01',
                    tom: '2019-04-30',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-05-01',
                    tom: '2019-05-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-06-01',
                    tom: '2019-06-30',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-07-01',
                    tom: '2019-07-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-08-01',
                    tom: '2019-08-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-09-01',
                    tom: '2019-09-30',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-10-01',
                    tom: '2019-10-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-11-01',
                    tom: '2019-11-30',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2019-12-01',
                    tom: '2019-12-31',
                },
                feilutbetaltBeløp: 5000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: {
                    fom: '2020-01-01',
                    tom: '2020-10-31',
                },
                feilutbetaltBeløp: 4000,
                hendelsestype: hendelsestype,
                foreldet: false,
            },
        ],
    };
};

const feilutbetalingVilkårsvurdering_ubehandlet_4 = (
    hendelsestype: HendelseType
): IFeilutbetalingVilkårsvurdering => {
    return {
        rettsgebyr: 1500,
        perioder: [
            {
                periode: { fom: '2019-04-01', tom: '2019-05-31' },
                feilutbetaltBeløp: 2000,
                aktiviteter: [
                    { aktivitet: 'Arbeidstaker', beløp: 1000 },
                    { aktivitet: 'Frilanser', beløp: 1000 },
                ],
                reduserteBeløper: [
                    { trekk: false, beløp: 1000 },
                    { trekk: true, beløp: 1000 },
                ],
                hendelsestype: hendelsestype,
                foreldet: false,
            },
            {
                periode: { fom: '2019-07-01', tom: '2019-08-31' },
                feilutbetaltBeløp: 2000,
                aktiviteter: [{ aktivitet: 'Arbeidstaker', beløp: 2000 }],
                reduserteBeløper: [{ trekk: false, beløp: 2000 }],
                hendelsestype: hendelsestype,
                foreldet: false,
            },
        ],
    };
};

export {
    feilutbetalingVilkårsvurdering_ubehandlet_1,
    feilutbetalingVilkårsvurdering_ubehandlet_2,
    feilutbetalingVilkårsvurdering_ubehandlet_3,
    feilutbetalingVilkårsvurdering_ubehandlet_4,
};
