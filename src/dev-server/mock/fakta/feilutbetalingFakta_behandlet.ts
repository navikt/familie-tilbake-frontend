import { HendelseType, HendelseUndertype } from '../../../frontend/kodeverk';
import {
    IFeilutbetalingFakta,
    Tilbakekrevingsvalg,
} from '../../../frontend/typer/feilutbetalingtyper';

const ba_feilutbetalingFakta_behandlet_1: IFeilutbetalingFakta = {
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
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
        konsekvensForYtelser: ['Opphør av ytelsen', 'Ytelsen redusert'],
    },
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2017-04-30',
            },
            feilutbetaltBeløp: 5000,
            hendelsestype: HendelseType.BA_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
        {
            periode: {
                fom: '2017-05-01',
                tom: '2020-09-01',
            },
            feilutbetaltBeløp: 4000,
            hendelsestype: HendelseType.BA_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
    ],
    begrunnelse: 'Dette er ein mock-begrunnelse!',
};

const ef_feilutbetalingFakta_behandlet_1: IFeilutbetalingFakta = {
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
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
        konsekvensForYtelser: ['Opphør av ytelsen', 'Ytelsen redusert'],
    },
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2017-04-30',
            },
            feilutbetaltBeløp: 5000,
            hendelsestype: HendelseType.EF_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
        {
            periode: {
                fom: '2017-05-01',
                tom: '2020-09-01',
            },
            feilutbetaltBeløp: 4000,
            hendelsestype: HendelseType.EF_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
    ],
    begrunnelse: 'Dette er ein mock-begrunnelse!',
};

const ks_feilutbetalingFakta_behandlet_1: IFeilutbetalingFakta = {
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
        tilbakekrevingsvalg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
        konsekvensForYtelser: ['Opphør av ytelsen', 'Ytelsen redusert'],
    },
    feilutbetaltePerioder: [
        {
            periode: {
                fom: '2013-01-01',
                tom: '2017-04-30',
            },
            feilutbetaltBeløp: 5000,
            hendelsestype: HendelseType.KS_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
        {
            periode: {
                fom: '2017-05-01',
                tom: '2020-09-01',
            },
            feilutbetaltBeløp: 4000,
            hendelsestype: HendelseType.KS_ANNET,
            hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
        },
    ],
    begrunnelse: 'Dette er ein mock-begrunnelse!',
};

export {
    ba_feilutbetalingFakta_behandlet_1,
    ef_feilutbetalingFakta_behandlet_1,
    ks_feilutbetalingFakta_behandlet_1,
};
