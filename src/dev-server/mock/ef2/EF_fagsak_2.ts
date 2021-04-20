import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import {
    Behandlingstype,
    Behandlingstatus,
    IBehandling,
    Behandlingårsak,
    Behandlingssteg,
    Behandlingsstegstatus,
} from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

const bruker: IPerson = {
    navn: 'Test Testesen',
    kjønn: kjønnType.MANN,
    fødselsdato: '1990-01-01',
    personIdent: '12345600001',
};

const behandlinger_2: IFagsakBehandling[] = [
    {
        behandlingId: 'ef4',
        eksternBrukId: '3',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ef5',
        eksternBrukId: '4',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ef2: IFagsak = {
    eksternFagsakId: 'ef2',
    fagsystem: Fagsystem.EF,
    ytelsestype: Ytelsetype.BARNETILSYN,
    bruker: bruker,
    behandlinger: behandlinger_2,
};

const ef_behandling_4: IBehandling = {
    behandlingId: 'ef4',
    eksternBrukId: '3',
    kanHenleggeBehandling: true,
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

const ef_behandling_5: IBehandling = {
    behandlingId: 'ef5',
    eksternBrukId: '4',
    kanHenleggeBehandling: true,
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

export { fagsak_ef2, ef_behandling_4, ef_behandling_5 };
