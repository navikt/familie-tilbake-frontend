import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import {
    Behandlingstype,
    Behandlingstatus,
    IBehandling,
    Behandlingssteg,
    Behandlingsstegstatus,
} from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling, Målform } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

const bruker: IPerson = {
    navn: 'Test Testesen',
    kjønn: kjønnType.MANN,
    fødselsdato: '1990-01-01',
    personIdent: '12345600001',
};

const behandlinger_2: IFagsakBehandling[] = [
    {
        behandlingId: 'ba4',
        eksternBrukId: '3',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba5',
        eksternBrukId: '4',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ba2: IFagsak = {
    eksternFagsakId: 'ba2',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.BARNETRYGD,
    bruker: bruker,
    behandlinger: behandlinger_2,
    språkkode: Målform.NB,
};

const ba_behandling_4: IBehandling = {
    behandlingId: 'ba4',
    eksternBrukId: '3',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

const ba_behandling_5: IBehandling = {
    behandlingId: 'ba5',
    eksternBrukId: '4',
    fagsystemsbehandlingId: 'ba123',
    kanHenleggeBehandling: true,
    kanRevurderingOpprettes: false,
    harVerge: true,
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
    manuelleBrevmottakere: [],
};

export { fagsak_ba2, ba_behandling_4, ba_behandling_5 };
