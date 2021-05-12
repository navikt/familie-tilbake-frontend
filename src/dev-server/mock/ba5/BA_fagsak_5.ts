import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import {
    Behandlingstype,
    Behandlingstatus,
    Behandlingårsak,
    Behandlingssteg,
    Behandlingsstegstatus,
    IBehandling,
} from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling } from '../../../frontend/typer/fagsak';
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
};

const ba_behandling_16: IBehandling = {
    behandlingId: 'ba16',
    eksternBrukId: '15',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ba_behandling_17: IBehandling = {
    behandlingId: 'ba17',
    eksternBrukId: '16',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ba_behandling_18: IBehandling = {
    behandlingId: 'ba18',
    eksternBrukId: '17',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ba_behandling_19: IBehandling = {
    behandlingId: 'ba19',
    eksternBrukId: '18',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ba_behandling_20: IBehandling = {
    behandlingId: 'ba20',
    eksternBrukId: '19',
    kanHenleggeBehandling: true,
    harVerge: true,
    kanEndres: true,
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
            behandlingsstegstatus: Behandlingsstegstatus.AUTOUTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

export {
    fagsak_ba5,
    ba_behandling_16,
    ba_behandling_17,
    ba_behandling_18,
    ba_behandling_19,
    ba_behandling_20,
};
