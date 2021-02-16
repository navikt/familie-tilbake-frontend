import React from 'react';

import createUseContext from 'constate';

import { byggSuksessRessurs, byggTomRessurs, Ressurs } from '@navikt/familie-typer';

import { Foreldelsevurdering, HendelseType, HendelseUndertype } from '../kodeverk/';
import {
    Behandlingresultat,
    Behandlingstatus,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
} from '../typer/behandling';
import { IFeilutbetalingFakta, IFeilutbetalingForeldelse } from '../typer/feilutbetalingtyper';

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
            behandlingFakta: {
                totalPeriodeFom: '2013-01-01',
                totalPeriodeTom: '2020-09-01',
                aktuellFeilUtbetaltBeløp: 9000,
                tidligereVarsletBeløp: 9300,
                datoForRevurderingsvedtak: '2020-12-05',
                behandlingsresultat: {
                    resultat: 'Opphør av ytelsen',
                    konsekvenserForYtelsen: ['Opphør av ytelsen', 'Ytelsen redusert'],
                },
                behandlingårsaker: ['Ny søknad', 'Dødsfall'],
                tilbakekrevingValg: {
                    videreBehandling: 'Tilbakekreving av ytelsen',
                },
                perioder: [
                    {
                        fom: '2013-01-01',
                        tom: '2017-04-30',
                        belop: 5000,
                        feilutbetalingÅrsakDto: {
                            hendelseType: HendelseType.BA_MEDLEMSKAP,
                            hendelseUndertype: HendelseUndertype.DØDSFALL,
                        },
                    },
                    {
                        fom: '2017-05-01',
                        tom: '2020-09-01',
                        belop: 4000,
                        feilutbetalingÅrsakDto: {
                            hendelseType: HendelseType.BA_ANNET,
                            hendelseUndertype: HendelseUndertype.ANNET_FRITEKST,
                        },
                    },
                ],
                begrunnelse: 'Dette er ein mock-begrunnelse!',
            },
        },
    ],
    [
        '3',
        {
            behandlingFakta: {
                totalPeriodeFom: '2013-02-01',
                totalPeriodeTom: '2020-09-01',
                aktuellFeilUtbetaltBeløp: 39000,
                tidligereVarsletBeløp: 43000,
                datoForRevurderingsvedtak: '2020-12-05',
                perioder: [
                    {
                        fom: '2013-02-01',
                        tom: '2013-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2014-02-01',
                        tom: '2014-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2015-02-01',
                        tom: '2015-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2016-02-01',
                        tom: '2016-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2017-02-01',
                        tom: '2017-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2018-02-01',
                        tom: '2018-11-01',
                        belop: 5000,
                    },
                    {
                        fom: '2019-03-01',
                        tom: '2019-09-01',
                        belop: 5000,
                    },
                    {
                        fom: '2020-04-01',
                        tom: '2020-10-01',
                        belop: 4000,
                    },
                ],
            },
        },
    ],
    [
        '4',
        {
            behandlingFakta: {
                totalPeriodeFom: '2013-01-01',
                totalPeriodeTom: '2020-10-31',
                aktuellFeilUtbetaltBeløp: 39000,
                tidligereVarsletBeløp: 43000,
                datoForRevurderingsvedtak: '2020-12-05',
                perioder: [
                    {
                        fom: '2013-01-01',
                        tom: '2018-12-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-01-01',
                        tom: '2019-01-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-02-01',
                        tom: '2019-02-28',
                        belop: 5000,
                    },
                    {
                        fom: '2019-03-01',
                        tom: '2019-03-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-04-01',
                        tom: '2019-04-30',
                        belop: 5000,
                    },
                    {
                        fom: '2019-05-01',
                        tom: '2019-05-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-06-01',
                        tom: '2019-06-30',
                        belop: 5000,
                    },
                    {
                        fom: '2019-07-01',
                        tom: '2019-07-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-08-01',
                        tom: '2019-08-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-09-01',
                        tom: '2019-09-30',
                        belop: 5000,
                    },
                    {
                        fom: '2019-10-01',
                        tom: '2019-10-31',
                        belop: 5000,
                    },
                    {
                        fom: '2019-11-01',
                        tom: '2019-11-30',
                        belop: 5000,
                    },
                    {
                        fom: '2019-12-01',
                        tom: '2019-12-31',
                        belop: 5000,
                    },
                    {
                        fom: '2020-01-01',
                        tom: '2020-10-31',
                        belop: 4000,
                    },
                ],
            },
        },
    ],
]);

const feilutbelingForeldelse = new Map<string, IFeilutbetalingForeldelse>([
    [
        '2',
        {
            perioder: [
                {
                    fom: '2013-01-01',
                    tom: '2017-04-30',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.FORELDET,
                    begrunnelse: 'Dette er ein mock-begrunnelse',
                    foreldelsesfrist: '2018-08-01',
                },
                {
                    fom: '2017-05-01',
                    tom: '2020-09-01',
                    belop: 4000,
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
                    fom: '2013-02-01',
                    tom: '2013-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2014-02-01',
                    tom: '2014-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2015-02-01',
                    tom: '2015-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2016-02-01',
                    tom: '2016-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2017-02-01',
                    tom: '2017-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2018-02-01',
                    tom: '2018-11-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-03-01',
                    tom: '2019-09-01',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2020-04-01',
                    tom: '2020-10-01',
                    belop: 4000,
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
                    fom: '2013-01-01',
                    tom: '2018-12-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-01-01',
                    tom: '2019-01-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-02-01',
                    tom: '2019-02-28',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-03-01',
                    tom: '2019-03-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-04-01',
                    tom: '2019-04-30',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-05-01',
                    tom: '2019-05-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-06-01',
                    tom: '2019-06-30',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-07-01',
                    tom: '2019-07-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-08-01',
                    tom: '2019-08-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-09-01',
                    tom: '2019-09-30',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-10-01',
                    tom: '2019-10-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-11-01',
                    tom: '2019-11-30',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2019-12-01',
                    tom: '2019-12-31',
                    belop: 5000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
                },
                {
                    fom: '2020-01-01',
                    tom: '2020-10-31',
                    belop: 4000,
                    foreldelseVurderingType: Foreldelsevurdering.UDEFINERT,
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

    return {
        åpenBehandling,
        hentBehandling,
        hentFeilutbetalingFakta,
        hentFeilutbetalingForeldelse,
    };
});

export { BehandlingProvider, useBehandling };
