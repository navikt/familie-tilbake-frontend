import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    Behandlingstype,
    IBehandling,
    Venteårsak,
} from '../../../frontend/typer/behandling';
import { dayIn21Days, yesterday } from '../utils';

const ba_behandling_6: IBehandling = {
    behandlingId: 'ba6',
    eksternBrukId: '5',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: false,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: true,
    kanEndres: true,
    varselSendt: false,
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_BRUKERTILBAKEMELDING,
            tidsfrist: dayIn21Days(),
        },
    ],
};

const ba_behandling_7: IBehandling = {
    behandlingId: 'ba7',
    eksternBrukId: '6',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: false,
    harVerge: true,
    type: Behandlingstype.TILBAKEKREVING,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: true,
    kanEndres: true,
    varselSendt: false,
    behandlingsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.VARSEL,
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.GRUNNLAG,
            behandlingsstegstatus: Behandlingsstegstatus.VENTER,
            venteårsak: Venteårsak.VENT_PÅ_TILBAKEKREVINGSGRUNNLAG,
            tidsfrist: yesterday(),
        },
    ],
};

const ba_behandling_8: IBehandling = {
    behandlingId: 'ba8',
    eksternBrukId: '7',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: true,
    kanEndres: true,
    varselSendt: false,
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
            tidsfrist: dayIn21Days(),
        },
    ],
};

const ba_behandling_9: IBehandling = {
    behandlingId: 'ba9',
    eksternBrukId: '8',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: false,
    harVerge: false,
    type: Behandlingstype.TILBAKEKREVING,
    status: Behandlingstatus.UTREDES,
    opprettetDato: '2020-12-02',
    erBehandlingPåVent: false,
    kanEndres: true,
    varselSendt: false,
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

export { ba_behandling_6, ba_behandling_7, ba_behandling_8, ba_behandling_9 };
