import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import {
    Behandlingstype,
    Behandlingstatus,
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
} from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling, Målform } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

const bruker: IPerson = {
    navn: 'Test Testesen',
    kjønn: kjønnType.MANN,
    fødselsdato: '1990-01-01',
    personIdent: '12345600001',
};

const behandlinger_5: IFagsakBehandling[] = [
    {
        behandlingId: 'ba16',
        eksternBrukId: '15',
        type: Behandlingstype.TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba17',
        eksternBrukId: '16',
        type: Behandlingstype.TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba18',
        eksternBrukId: '17',
        type: Behandlingstype.TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba19',
        eksternBrukId: '18',
        type: Behandlingstype.TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba20',
        eksternBrukId: '19',
        type: Behandlingstype.TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ba5: IFagsak = {
    eksternFagsakId: 'ba5',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.BARNETRYGD,
    bruker: bruker,
    behandlinger: behandlinger_5,
    språkkode: Målform.NB,
};

const ba_behandling_16: IBehandling = {
    behandlingId: 'ba16',
    eksternBrukId: '15',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    kanEndres: true,
    varselSendt: false,
    type: Behandlingstype.TILBAKEKREVING,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

const ba_behandling_17: IBehandling = {
    behandlingId: 'ba17',
    eksternBrukId: '16',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    kanEndres: true,
    varselSendt: false,
    type: Behandlingstype.TILBAKEKREVING,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

const ba_behandling_18: IBehandling = {
    behandlingId: 'ba18',
    eksternBrukId: '17',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    kanEndres: true,
    varselSendt: false,
    type: Behandlingstype.TILBAKEKREVING,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

const ba_behandling_19: IBehandling = {
    behandlingId: 'ba19',
    eksternBrukId: '18',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    kanEndres: true,
    varselSendt: false,
    type: Behandlingstype.TILBAKEKREVING,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

const ba_behandling_20: IBehandling = {
    behandlingId: 'ba20',
    eksternBrukId: '19',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    kanEndres: true,
    varselSendt: false,
    type: Behandlingstype.TILBAKEKREVING,
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
            behandlingsstegstatus: Behandlingsstegstatus.AUTOUTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

export {
    fagsak_ba5,
    ba_behandling_16,
    ba_behandling_17,
    ba_behandling_18,
    ba_behandling_19,
    ba_behandling_20,
};
