import React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';
import { useHistory } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggSuksessRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import {
    Aktsomhet,
    Avsnittstype,
    Fagsystem,
    Foreldelsevurdering,
    HendelseType,
    SærligeGrunner,
    Underavsnittstype,
    Vedtaksresultat,
    Vilkårsresultat,
    Vurdering,
} from '../kodeverk/';
import {
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
    IBehandlingsstegstilstand,
} from '../typer/behandling';
import { IFagsak } from '../typer/fagsak';
import {
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
} from '../typer/feilutbetalingtyper';
import { IBeregningsresultat, IVedtaksbrev } from '../typer/vedtakTyper';
import { useFagsak } from './FagsakContext';

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

const beregningsResultater = new Map<string, IBeregningsresultat>([
    [
        '2',
        {
            vedtaksresultat: Vedtaksresultat.DELVIS_TILBAKEBETALING,
            perioder: [
                {
                    periode: { fom: '2013-01-01', tom: '2017-04-30' },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORELDET,
                    tilbakekrevingBeløp: 0,
                    tilbakekrevingBeløpEtterSkatt: 0,
                },
                {
                    periode: { fom: '2017-05-01', tom: '2020-09-01' },
                    feilutbetaltBeløp: 4000,
                    vurdering: Vurdering.GROVT_UAKTSOM,
                    andelAvBeløp: 100,
                    tilbakekrevingBeløp: 4000,
                    tilbakekrevingBeløpEtterSkatt: 4000,
                },
            ],
        },
    ],
    [
        '3',
        {
            vedtaksresultat: Vedtaksresultat.FULL_TILBAKEBETALING,
            perioder: [
                {
                    periode: {
                        fom: '2013-02-01',
                        tom: '2013-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2014-02-01',
                        tom: '2014-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2015-02-01',
                        tom: '2015-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2016-02-01',
                        tom: '2016-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2017-02-01',
                        tom: '2017-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2018-02-01',
                        tom: '2018-11-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-09-01',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2020-04-01',
                        tom: '2020-10-01',
                    },
                    feilutbetaltBeløp: 4000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 4000,
                    tilbakekrevingBeløpEtterSkatt: 4000,
                },
            ],
        },
    ],
    [
        '4',
        {
            vedtaksresultat: Vedtaksresultat.INGEN_TILBAKEBETALING,
            perioder: [
                {
                    periode: {
                        fom: '2013-01-01',
                        tom: '2018-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-01-01',
                        tom: '2019-01-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-02-01',
                        tom: '2019-02-28',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-03-01',
                        tom: '2019-03-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-04-01',
                        tom: '2019-04-30',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-05-01',
                        tom: '2019-05-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-06-01',
                        tom: '2019-06-30',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-07-01',
                        tom: '2019-07-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-08-01',
                        tom: '2019-08-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-09-01',
                        tom: '2019-09-30',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-10-01',
                        tom: '2019-10-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-11-01',
                        tom: '2019-11-30',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2019-12-01',
                        tom: '2019-12-31',
                    },
                    feilutbetaltBeløp: 5000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 5000,
                    tilbakekrevingBeløpEtterSkatt: 5000,
                },
                {
                    periode: {
                        fom: '2020-01-01',
                        tom: '2020-10-31',
                    },
                    feilutbetaltBeløp: 4000,
                    vurdering: Vurdering.GOD_TRO,
                    tilbakekrevingBeløp: 4000,
                    tilbakekrevingBeløpEtterSkatt: 4000,
                },
            ],
        },
    ],
    [
        '5',
        {
            vedtaksresultat: Vedtaksresultat.INGEN_TILBAKEBETALING,
            perioder: [
                {
                    periode: { fom: '2019-04-01', tom: '2019-05-31' },
                    feilutbetaltBeløp: 2000,
                    vurdering: Vurdering.GROVT_UAKTSOM,
                    andelAvBeløp: 100,
                    tilbakekrevingBeløp: 2000,
                    tilbakekrevingBeløpEtterSkatt: 2000,
                },
                {
                    periode: { fom: '2019-07-01', tom: '2019-08-31' },
                    feilutbetaltBeløp: 2000,
                    vurdering: Vurdering.FORSETT,
                    andelAvBeløp: 100,
                    renterProsent: 10,
                    tilbakekrevingBeløp: 2000,
                    tilbakekrevingBeløpEtterSkatt: 2000,
                },
            ],
        },
    ],
]);

const vedtaksbrever = new Map<string, IVedtaksbrev>([
    [
        '2',
        {
            avsnittsliste: [
                {
                    avsnittstype: Avsnittstype.OPPSUMMERING,
                    overskrift: 'Betale tilbake?',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.OPPSUMMERING,
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            overskrift: 'Overskrift 1',
                            brødtekst: 'Brødtekst 1',
                            fritekst: 'Fritekst 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 2 - per 1',
                    fom: '2013-01-01',
                    tom: '2017-04-30',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 1',
                            fritekst: 'Fritekst fakta per 1',
                        },
                        {
                            underavsnittstype: Underavsnittstype.FORELDELSE,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            overskrift: 'Foreldelse per 1',
                            brødtekst: 'Brødtekst foreldelse per 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 3 - per 2',
                    fom: '2017-05-01',
                    tom: '2020-09-01',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 2',
                        },
                        {
                            underavsnittstype: Underavsnittstype.SARLIGEGRUNNER_ANNET,
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            overskrift: 'Oppsummering per 2',
                            brødtekst: 'Brødtekst oppsummering per 2',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.TILLEGGSINFORMASJON,
                    overskrift: 'Lovhjemler vi bruker?',
                    underavsnittsliste: [
                        {
                            fritekstTillatt: false,
                            overskrift: 'Avsluttende informasjon',
                            brødtekst: 'Brødtekst avsluttende informasjon',
                        },
                    ],
                },
            ],
        },
    ],
    [
        '3',
        {
            avsnittsliste: [
                {
                    avsnittstype: Avsnittstype.OPPSUMMERING,
                    overskrift: 'Betale tilbake?',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.OPPSUMMERING,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            overskrift: 'Overskrift 1',
                            brødtekst: 'Brødtekst 1',
                            fritekst: 'Fritekst 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 2 - per 1',
                    fom: '2013-01-01',
                    tom: '2017-04-30',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 1',
                        },
                        {
                            underavsnittstype: Underavsnittstype.FORELDELSE,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            overskrift: 'Foreldelse per 1',
                            brødtekst: 'Brødtekst foreldelse per 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 3 - per 2',
                    fom: '2017-05-01',
                    tom: '2020-09-01',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 2',
                        },
                        {
                            underavsnittstype: Underavsnittstype.SARLIGEGRUNNER_ANNET,
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            overskrift: 'Oppsummering per 2',
                            brødtekst: 'Brødtekst oppsummering per 2',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.TILLEGGSINFORMASJON,
                    overskrift: 'Lovhjemler vi bruker?',
                    underavsnittsliste: [
                        {
                            fritekstTillatt: false,
                            overskrift: 'Avsluttende informasjon',
                            brødtekst: 'Brødtekst avsluttende informasjon',
                        },
                    ],
                },
            ],
        },
    ],
    [
        '4',
        {
            avsnittsliste: [
                {
                    avsnittstype: Avsnittstype.OPPSUMMERING,
                    overskrift: 'Betale tilbake?',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.OPPSUMMERING,
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            overskrift: 'Overskrift 1',
                            brødtekst: 'Brødtekst 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 2 - per 1',
                    fom: '2013-01-01',
                    tom: '2017-04-30',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 1',
                        },
                        {
                            underavsnittstype: Underavsnittstype.FORELDELSE,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            overskrift: 'Foreldelse per 1',
                            brødtekst: 'Brødtekst foreldelse per 1',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.PERIODE,
                    overskrift: 'Avsnitt 3 - per 2',
                    fom: '2017-05-01',
                    tom: '2020-09-01',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.FAKTA,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            brødtekst: 'Brødtekst fakta per 2',
                        },
                        {
                            underavsnittstype: Underavsnittstype.SARLIGEGRUNNER_ANNET,
                            fritekstTillatt: true,
                            fritekstPåkrevet: true,
                            overskrift: 'Oppsummering per 2',
                            brødtekst: 'Brødtekst oppsummering per 2',
                        },
                    ],
                },
                {
                    avsnittstype: Avsnittstype.TILLEGGSINFORMASJON,
                    overskrift: 'Lovhjemler vi bruker?',
                    underavsnittsliste: [
                        {
                            fritekstTillatt: false,
                            overskrift: 'Avsluttende informasjon',
                            brødtekst: 'Brødtekst avsluttende informasjon',
                        },
                    ],
                },
            ],
        },
    ],
    [
        '5',
        {
            avsnittsliste: [
                {
                    avsnittstype: Avsnittstype.OPPSUMMERING,
                    overskrift: 'Avsnitt 1',
                    underavsnittsliste: [
                        {
                            underavsnittstype: Underavsnittstype.OPPSUMMERING,
                            fritekstTillatt: true,
                            fritekstPåkrevet: false,
                            overskrift: 'Overskrift 1',
                            brødtekst: 'Brødtekst 1',
                            fritekst: 'Fritekst 1',
                        },
                    ],
                },
            ],
        },
    ],
]);

const erStegUtført = (status: Behandlingsstegstatus) => {
    return status === Behandlingsstegstatus.UTFØRT || status === Behandlingsstegstatus.AUTOUTFØRT;
};

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [behandling, settBehandling] = React.useState<Ressurs<IBehandling>>();
    const [aktivtSteg, settAktivtSteg] = React.useState<IBehandlingsstegstilstand>();
    const [ventegrunn, settVentegrunn] = React.useState<IBehandlingsstegstilstand>();
    const [visVenteModal, settVisVenteModal] = React.useState<boolean>(false);
    const [harKravgrunnlag, settHarKravgrunnlag] = React.useState<boolean>();
    const [behandlingILesemodus, settBehandlingILesemodus] = React.useState<boolean>();
    const { fagsak } = useFagsak();
    const { request } = useHttp();
    const history = useHistory();

    const hentBehandlingMedEksternBrukId = (fagsak: IFagsak, behandlingId: string): void => {
        const fagsakBehandling = fagsak.behandlinger.find(
            behandling => behandling.eksternBrukId === behandlingId
        );
        if (fagsakBehandling) {
            hentBehandlingMedBehandlingId(fagsakBehandling.behandlingId);
        } else {
            settBehandling(byggFeiletRessurs('Fann ikke behandling'));
        }
    };

    const hentBehandlingMedBehandlingId = (
        behandlingId: string,
        henterEtterInnsendingAvSteg?: boolean | false
    ): void => {
        settBehandling(byggHenterRessurs());
        settAktivtSteg(null);
        settHarKravgrunnlag(null);
        settBehandlingILesemodus(null);
        settVentegrunn(null);
        settVisVenteModal(false);
        request<void, IBehandling>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/v1/${behandlingId}`,
        })
            .then((hentetBehandling: Ressurs<IBehandling>) => {
                if (hentetBehandling.status === RessursStatus.SUKSESS) {
                    const erILeseModus =
                        hentetBehandling.data.erBehandlingPåVent ||
                        hentetBehandling.data.behandlingsstegsinfo.some(
                            stegInfo =>
                                stegInfo.behandlingssteg === Behandlingssteg.AVSLUTTET ||
                                stegInfo.behandlingssteg === Behandlingssteg.IVERKSETT_VEDTAK ||
                                (stegInfo.behandlingssteg === Behandlingssteg.FATTE_VEDTAK &&
                                    stegInfo.behandlingsstegstatus === Behandlingsstegstatus.KLAR)
                        );
                    settBehandlingILesemodus(erILeseModus);

                    const harFåttKravgrunnlag = hentetBehandling.data.behandlingsstegsinfo.some(
                        stegInfo => stegInfo.behandlingssteg === Behandlingssteg.FAKTA
                    );
                    settHarKravgrunnlag(harFåttKravgrunnlag);

                    const funnetAktivtsteg = hentetBehandling.data.behandlingsstegsinfo.find(
                        stegInfo =>
                            stegInfo.behandlingsstegstatus === Behandlingsstegstatus.KLAR ||
                            stegInfo.behandlingsstegstatus === Behandlingsstegstatus.VENTER
                    );
                    if (funnetAktivtsteg) {
                        settAktivtSteg(funnetAktivtsteg);
                        if (
                            funnetAktivtsteg.behandlingsstegstatus === Behandlingsstegstatus.VENTER
                        ) {
                            settVentegrunn(funnetAktivtsteg);
                            settVisVenteModal(true);
                        }
                    }
                    if (henterEtterInnsendingAvSteg) {
                        history.push(
                            `/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/behandling/${hentetBehandling.data.eksternBrukId}`
                        );
                    }
                }
                settBehandling(hentetBehandling);
            })
            .catch((error: AxiosError) => {
                console.log('Error: ', error);
                settBehandling(byggFeiletRessurs('Ukjent feil ved henting av behandling'));
            });
    };

    const erStegBehandlet = (steg: Behandlingssteg): boolean => {
        if (behandling?.status === RessursStatus.SUKSESS) {
            return behandling.data.behandlingsstegsinfo.some(
                stegInfo =>
                    stegInfo.behandlingssteg === steg &&
                    erStegUtført(stegInfo.behandlingsstegstatus)
            );
        }
        return false;
    };

    const utledBehandlingId = () => {
        if (
            behandling?.status === RessursStatus.SUKSESS &&
            fagsak?.status === RessursStatus.SUKSESS
        ) {
            switch (fagsak.data.fagsystem) {
                case Fagsystem.BA:
                    return '2';
                case Fagsystem.EF:
                    return '3';
                case Fagsystem.KS:
                    return '4';
                default:
                    return '5';
            }
        } else {
            return '5';
        }
    };

    const hentFeilutbetalingForeldelse = (
        _behandlingId: string
    ): Ressurs<IFeilutbetalingForeldelse> => {
        const behandlingId = utledBehandlingId();
        const foreldelse = feilutbelingForeldelse.get(behandlingId);
        return foreldelse ? byggSuksessRessurs(foreldelse) : byggTomRessurs();
    };

    const hentFeilutbetalingVilkårsvurdering = (
        _behandlingId: string
    ): Ressurs<IFeilutbetalingVilkårsvurdering> => {
        const behandlingId = utledBehandlingId();
        const vilkårsvurdering = feilutbetalingVilkårsvurdering.get(behandlingId);
        return vilkårsvurdering ? byggSuksessRessurs(vilkårsvurdering) : byggTomRessurs();
    };

    const hentBeregningsresultat = (_behandlingId: string): Ressurs<IBeregningsresultat> => {
        const behandlingId = utledBehandlingId();
        const beregningsresultat = beregningsResultater.get(behandlingId);
        return beregningsresultat ? byggSuksessRessurs(beregningsresultat) : byggTomRessurs();
    };

    const hentVedtaksbrev = (_behandlingId: string): Ressurs<IVedtaksbrev> => {
        const behandlingId = utledBehandlingId();
        const vedtaksbrev = vedtaksbrever.get(behandlingId);
        return vedtaksbrev ? byggSuksessRessurs(vedtaksbrev) : byggTomRessurs();
    };

    return {
        behandling,
        hentBehandlingMedEksternBrukId,
        hentBehandlingMedBehandlingId,
        behandlingILesemodus,
        aktivtSteg,
        ventegrunn,
        visVenteModal,
        settVisVenteModal,
        erStegBehandlet,
        harKravgrunnlag,
        hentFeilutbetalingForeldelse,
        hentFeilutbetalingVilkårsvurdering,
        hentBeregningsresultat,
        hentVedtaksbrev,
    };
});

export { BehandlingProvider, useBehandling };
