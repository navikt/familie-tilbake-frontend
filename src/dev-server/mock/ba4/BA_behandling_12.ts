import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    Behandlingstype,
    Behandlingårsak,
    IBehandling,
} from '../../../frontend/typer/behandling';

const ba_behandling_12: IBehandling = {
    behandlingId: 'ba12',
    eksternBrukId: '11',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FATTE_VEDTAK,
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

export { ba_behandling_12 };
