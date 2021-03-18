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

const ba_behandling_6: IBehandling = {
    behandlingId: 'ba6',
    eksternBrukId: '5',
    kanHenleggeBehandling: false,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_BRUKERTILBAKEMELDING,
        },
    ],
};

const ba_behandling_7: IBehandling = {
    behandlingId: 'ba7',
    eksternBrukId: '6',
    kanHenleggeBehandling: false,
    harVerge: true,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: true,
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.GRUNNLAG,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_TILBAKEKREVINGSGRUNNLAG,
        },
    ],
};

const ba_behandling_8: IBehandling = {
    behandlingId: 'ba8',
    eksternBrukId: '7',
    kanHenleggeBehandling: true,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: true,
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
            venteårsak: Venteårsak.VENT_PÅ_BRUKERTILBAKEMELDING,
        },
        {
            behandlingssteg: Behandlingssteg.GRUNNLAG,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FAKTA,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_BRUKERTILBAKEMELDING,
        },
    ],
};

const ba_feilutbetalingFakta_8: IFeilutbetalingFakta = {
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

const ba_behandling_9: IBehandling = {
    behandlingId: 'ba9',
    eksternBrukId: '8',
    kanHenleggeBehandling: false,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    årsak: Behandlingårsak.NYE_OPPLYSNINGER,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ba_feilutbetalingFakta_9: IFeilutbetalingFakta = {
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

export {
    ba_behandling_6,
    ba_behandling_7,
    ba_behandling_8,
    ba_feilutbetalingFakta_8,
    ba_behandling_9,
    ba_feilutbetalingFakta_9,
};
