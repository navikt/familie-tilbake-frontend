import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
    Venteårsak,
} from '../../../frontend/typer/behandling';
import { dayIn21Days } from '../utils';

const ba_behandling_13: IBehandling = {
    behandlingId: 'ba13',
    eksternBrukId: '12',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    erBehandlingPåVent: true,
    kanEndres: true,
    harVerge: true,
    varselSendt: false,
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
            tidsfrist: dayIn21Days(),
        },
    ],
};

export { ba_behandling_13 };
