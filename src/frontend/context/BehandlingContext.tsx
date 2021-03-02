import React from 'react';

import createUseContext from 'constate';

import { byggSuksessRessurs, byggTomRessurs, Ressurs } from '@navikt/familie-typer';

import {
    Aktsomhet,
    Foreldelsevurdering,
    HendelseType,
    HendelseUndertype,
    SærligeGrunner,
    Vilkårsresultat,
} from '../kodeverk/';
import {
    Behandlingresultat,
    Behandlingstatus,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
} from '../typer/behandling';
import {
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
    Tilbakekrevingsvalg,
} from '../typer/feilutbetalingtyper';

const behandlingMock = {
    aktiv: true,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    resultat: Behandlingresultat.IKKE_VURDERT,
    status: Behandlingstatus.UTREDES,
};

const feilUtbetalingFakta = new Map<string, IFeilutbetalingFakta>([
    [
        '2',
        {
            totalFeilutbetaltPeriode: { fom: '2013-01-01', tom: '2020-09-01' },
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
                    periode: { fom: '2013-01-01', tom: '2017-04-30' },
                    feilutbetaltBeløp: 5000,
                    hendelsestype: HendelseType.BA_MEDLEMSKAP,
                    hendelsesundertype: HendelseUndertype.DØDSFALL,
                },
                {
                    periode: { fom: '2017-05-01', tom: '2020-09-01' },
                    feilutbetaltBeløp: 4000,
                    hendelsestype: HendelseType.BA_ANNET,
                    hendelsesundertype: HendelseUndertype.ANNET_FRITEKST,
                },
            ],
            begrunnelse: 'Dette er ein mock-begrunnelse!',
        },
    ],
    [
        '3',
        {
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
        },
    ],
    [
        '4',
        {
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
        },
    ],
    [
        '5',
        {
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
        },
    ],
]);

const feilutbelingForeldelse = new Map<string, IFeilutbetalingForeldelse>([
    [
        '2',
        {
            perioder: [
                {
                    periode: {
                        fom: '2013-01-01',
                        tom: '2017-04-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.FORELDET,
                    begrunnelse: 'Dette er ein mock-begrunnelse',
                    foreldelsesfrist: '2018-08-01',
                },
                {
                    periode: {
                        fom: '2017-05-01',
                        tom: '2020-09-01',
                    },
                    feilutbetaltBeløp: 4000,
                    foreldelseVurderingType: Foreldelsevurdering.TILLEGGSFRIST,
                    begrunnelse: 'Dette er ein mock-begrunnelse',
                    foreldelsesfrist: '2019-06-01',
                    oppdagelsesDato: '2020-11-01',
                },
            ],
        },
    ],
    [
        '3',
        {
            perioder: [
                {
                    periode: {
                        fom: '2013-02-01',
                        tom: '2013-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2014-02-01',
                        tom: '2014-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2015-02-01',
                        tom: '2015-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2016-02-01',
                        tom: '2016-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2017-02-01',
                        tom: '2017-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2018-02-01',
                        tom: '2018-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-09-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2020-04-01',
                        tom: '2020-10-01',
                    },
                    feilutbetaltBeløp: 4000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
            ],
        },
    ],
    [
        '4',
        {
            perioder: [
                {
                    periode: {
                        fom: '2013-01-01',
                        tom: '2018-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-01-01',
                        tom: '2019-01-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-02-01',
                        tom: '2019-02-28',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-03-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-04-01',
                        tom: '2019-04-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-05-01',
                        tom: '2019-05-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-06-01',
                        tom: '2019-06-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-07-01',
                        tom: '2019-07-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-08-01',
                        tom: '2019-08-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-09-01',
                        tom: '2019-09-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-10-01',
                        tom: '2019-10-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-11-01',
                        tom: '2019-11-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2019-12-01',
                        tom: '2019-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: {
                        fom: '2020-01-01',
                        tom: '2020-10-31',
                    },
                    feilutbetaltBeløp: 4000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
            ],
        },
    ],
    [
        '5',
        {
            perioder: [
                {
                    periode: { fom: '2019-04-01', tom: '2019-05-31' },
                    feilutbetaltBeløp: 2000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    periode: { fom: '2019-07-01', tom: '2019-08-31' },
                    feilutbetaltBeløp: 2000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
            ],
        },
    ],
]);

const feilutbetalingVilkårsvurdering = new Map<string, IFeilutbetalingVilkårsvurdering>([
    [
        '2',
        {
            rettsgebyr: 1500,
            perioder: [
                {
                    periode: {
                        fom: '2013-01-01',
                        tom: '2017-04-30',
                    },
                    ytelser: [
                        { aktivitet: 'Arbeidstaker', beløp: 2000 },
                        { aktivitet: 'Frilanser', beløp: 3000 },
                    ],
                    feilutbetaltBeløp: 5000,
                    hendelseType: HendelseType.BA_MEDLEMSKAP,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.FORELDET,
                        begrunnelse: 'Dette er ein mock-begrunnelse',
                    },
                },
                {
                    periode: {
                        fom: '2017-05-01',
                        tom: '2020-09-01',
                    },
                    ytelser: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                    feilutbetaltBeløp: 4000,
                    hendelseType: HendelseType.BA_MEDLEMSKAP,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.TILLEGGSFRIST,
                    },
                    vilkårsresultat: {
                        vilkårsresultat: Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                        begrunnelse: 'Dette er ein mock-begrunnelse',
                        aktsomhetsvurdering: {
                            begrunnelse: 'Dette er ein mock-begrunnelse',
                            aktsomhet: Aktsomhet.GROVT_UAKTSOM,
                            særligGrunnerBegrunnelse: 'Dette er ein mock-begrunnelse',
                            harGrunnerTilReduksjon: true,
                            andelTilbakekreves: 33,
                            særligeGrunner: [
                                SærligeGrunner.GRAD_AV_UAKTSOMHET,
                                SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
                                SærligeGrunner.ANNET,
                            ],
                            annetBegrunnelse: 'Dette er ein mock-begrunnelse',
                        },
                    },
                },
            ],
        },
    ],
    [
        '3',
        {
            rettsgebyr: 1300,
            perioder: [
                {
                    periode: {
                        fom: '2013-02-01',
                        tom: '2013-11-01',
                    },
                    ytelser: [
                        { aktivitet: 'Arbeidstaker', beløp: 2000 },
                        { aktivitet: 'Frilanser', beløp: 3000 },
                    ],
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2014-02-01',
                        tom: '2014-11-01',
                    },
                    ytelser: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2015-02-01',
                        tom: '2015-11-01',
                    },
                    ytelser: [
                        { aktivitet: 'Arbeidstaker', beløp: 2000 },
                        { aktivitet: 'Frilanser', beløp: 3000 },
                    ],
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2016-02-01',
                        tom: '2016-11-01',
                    },
                    ytelser: [{ aktivitet: 'Arbeidstaker', beløp: 4000 }],
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2017-02-01',
                        tom: '2017-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2018-02-01',
                        tom: '2018-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-09-01',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2020-04-01',
                        tom: '2020-10-01',
                    },
                    feilutbetaltBeløp: 4000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
            ],
        },
    ],
    [
        '4',
        {
            rettsgebyr: 1500,
            perioder: [
                {
                    periode: {
                        fom: '2013-01-01',
                        tom: '2018-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-01-01',
                        tom: '2019-01-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-02-01',
                        tom: '2019-02-28',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-03-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-04-01',
                        tom: '2019-04-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-05-01',
                        tom: '2019-05-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-06-01',
                        tom: '2019-06-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-07-01',
                        tom: '2019-07-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-08-01',
                        tom: '2019-08-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-09-01',
                        tom: '2019-09-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-10-01',
                        tom: '2019-10-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-11-01',
                        tom: '2019-11-30',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2019-12-01',
                        tom: '2019-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: {
                        fom: '2020-01-01',
                        tom: '2020-10-31',
                    },
                    feilutbetaltBeløp: 4000,
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
            ],
        },
    ],
    [
        '5',
        {
            rettsgebyr: 1500,
            perioder: [
                {
                    periode: { fom: '2019-04-01', tom: '2019-05-31' },
                    feilutbetaltBeløp: 2000,
                    ytelser: [
                        { aktivitet: 'Arbeidstaker', beløp: 1000 },
                        { aktivitet: 'Frilanser', beløp: 1000 },
                    ],
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
                {
                    periode: { fom: '2019-07-01', tom: '2019-08-31' },
                    feilutbetaltBeløp: 2000,
                    ytelser: [{ aktivitet: 'Arbeidstaker', beløp: 2000 }],
                    foreldelse: {
                        foreldelseVurderingType: Foreldelsevurdering.IKKE_VURDERT,
                    },
                },
            ],
        },
    ],
]);

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [åpenBehandling, settÅpenBehandling] = React.useState<Ressurs<IBehandling>>();

    const hentBehandling = (behandlingId: string): void => {
        settÅpenBehandling(
            byggSuksessRessurs({
                id: behandlingId,
                eksternBrukId: behandlingId,
                kanHenleggeBehandling: behandlingId === '3',
                harVerge: behandlingId === '2',
                ...behandlingMock,
            })
        );
    };

    const hentFeilutbetalingFakta = (behandlingId: string): Ressurs<IFeilutbetalingFakta> => {
        const fakta = feilUtbetalingFakta.get(behandlingId);
        return fakta ? byggSuksessRessurs(fakta) : byggTomRessurs();
    };

    const hentFeilutbetalingForeldelse = (
        behandlingId: string
    ): Ressurs<IFeilutbetalingForeldelse> => {
        const foreldelse = feilutbelingForeldelse.get(behandlingId);
        return foreldelse ? byggSuksessRessurs(foreldelse) : byggTomRessurs();
    };

    const hentFeilutbetalingVilkårsvurdering = (
        behandlingId: string
    ): Ressurs<IFeilutbetalingVilkårsvurdering> => {
        const vilkårsvurdering = feilutbetalingVilkårsvurdering.get(behandlingId);
        return vilkårsvurdering ? byggSuksessRessurs(vilkårsvurdering) : byggTomRessurs();
    };

    return {
        åpenBehandling,
        hentBehandling,
        hentFeilutbetalingFakta,
        hentFeilutbetalingForeldelse,
        hentFeilutbetalingVilkårsvurdering,
    };
});

export { BehandlingProvider, useBehandling };
