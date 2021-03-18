import { HendelseType, HendelseUndertype } from '../../../frontend/kodeverk';
import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
    Venteårsak,
} from '../../../frontend/typer/behandling';
import {
    IFeilutbetalingFakta,
    Tilbakekrevingsvalg,
} from '../../../frontend/typer/feilutbetalingtyper';

const ba_behandling_13: IBehandling = {
    behandlingId: 'ba13',
    eksternBrukId: '12',
    kanHenleggeBehandling: true,
    erBehandlingPåVent: true,
    harVerge: true,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.GRUNNLAG,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FAKTA,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FORELDELSE,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_BRUKERTILBAKEMELDING,
        },
    ],
};

const ba_feilutbetalingFakta_13: IFeilutbetalingFakta = {
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
            hendelsestype: HendelseType.BA_MEDLEMSKAP,
            hendelsesundertype: HendelseUndertype.DØDSFALL,
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

export { ba_behandling_13, ba_feilutbetalingFakta_13 };
