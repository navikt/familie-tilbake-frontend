import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import {
    Behandlingstype,
    Behandlingstatus,
    IBehandling,
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
        behandlingId: 'ks4',
        eksternBrukId: '3',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ks2: IFagsak = {
    eksternFagsakId: 'ks2',
    fagsystem: Fagsystem.KS,
    ytelsestype: Ytelsetype.KONTANTSTØTTE,
    bruker: bruker,
    behandlinger: behandlinger_2,
};

const ks_behandling_4: IBehandling = {
    behandlingId: 'ks4',
    eksternBrukId: '3',
    fagsystemsbehandlingId: 'ks123',
    kanHenleggeBehandling: true,
    erBehandlingPåVent: false,
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
            behandlingsstegstatus: Behandlingsstegstatus.UTFØRT,
        },
        {
            behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
            behandlingsstegstatus: Behandlingsstegstatus.KLAR,
        },
    ],
};

export { fagsak_ks2, ks_behandling_4 };
