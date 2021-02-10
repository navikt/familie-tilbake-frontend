import React from 'react';

import createUseContext from 'constate';

import { byggSuksessRessurs, byggTomRessurs, Ressurs } from '@navikt/familie-typer';

import { HendelseType, HendelseUndertype } from '../kodeverk/feilutbetalingsÅrsak';
import {
    BehandlingResultat,
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    IBehandling,
} from '../typer/behandling';
import { IFeilutbetalingFakta } from '../typer/feilutbetalingFakta';

const behandlingMock = {
    aktiv: true,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
    resultat: BehandlingResultat.IKKE_VURDERT,
    status: BehandlingStatus.UTREDES,
};

const feilUtbetalingFakta = new Map<string, IFeilutbetalingFakta>([
    [
        '2',
        {
            behandlingFakta: {
                totalPeriodeFom: '2020-01-01',
                totalPeriodeTom: '2020-09-01',
                aktuellFeilUtbetaltBeløp: 9000,
                tidligereVarsletBeløp: 9300,
                datoForRevurderingsvedtak: '2020-12-05',
                behandlingsresultat: {
                    resultat: 'Opphør av ytelsen',
                    konsekvenserForYtelsen: ['Opphør av ytelsen', 'Ytelsen redusert'],
                },
                behandlingÅrsaker: ['Ny søknad', 'Dødsfall'],
                tilbakekrevingValg: {
                    videreBehandling: 'Tilbakekreving av ytelsen',
                },
                perioder: [
                    {
                        fom: '2020-01-01',
                        tom: '2020-04-01',
                        belop: 5000,
                        feilutbetalingÅrsakDto: {
                            hendelseType: HendelseType.BA_MEDLEMSKAP,
                            hendelseUndertype: HendelseUndertype.DØDSFALL,
                        },
                    },
                    {
                        fom: '2020-06-01',
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
                totalPeriodeFom: '2020-01-01',
                totalPeriodeTom: '2020-09-01',
                aktuellFeilUtbetaltBeløp: 9000,
                tidligereVarsletBeløp: 9300,
                datoForRevurderingsvedtak: '2020-12-05',
                perioder: [
                    {
                        fom: '2020-01-01',
                        tom: '2020-04-01',
                        belop: 5000,
                    },
                    {
                        fom: '2020-06-01',
                        tom: '2020-09-01',
                        belop: 4000,
                    },
                ],
            },
        },
    ],
]);

const [BehandlingProvider, useBehandling] = createUseContext(() => {
    const [åpenBehandling, settÅpenBehandling] = React.useState<Ressurs<IBehandling>>();

    const hentBehandling = (behandlingId: string): void => {
        settÅpenBehandling(
            byggSuksessRessurs({ id: behandlingId, eksternBrukId: behandlingId, ...behandlingMock })
        );
    };

    const hentFeilutbetalingFakta = (behandlingId: string): Ressurs<IFeilutbetalingFakta> => {
        const fakta = feilUtbetalingFakta.get(behandlingId);
        return fakta ? byggSuksessRessurs(fakta) : byggTomRessurs();
    };

    return {
        åpenBehandling,
        hentBehandling,
        hentFeilutbetalingFakta,
    };
});

export { BehandlingProvider, useBehandling };
