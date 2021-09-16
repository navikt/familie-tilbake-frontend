import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import { Behandlingstatus, Behandlingstype } from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling, Målform } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

export * from './BA_behandling_venter';

const bruker: IPerson = {
    navn: 'Test Testesen',
    kjønn: kjønnType.MANN,
    fødselsdato: '1990-01-01',
    personIdent: '12345600001',
};

const behandlinger_3: IFagsakBehandling[] = [
    {
        behandlingId: 'ba6',
        eksternBrukId: '5',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba7',
        eksternBrukId: '6',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba8',
        eksternBrukId: '7',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba9',
        eksternBrukId: '8',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ba3: IFagsak = {
    eksternFagsakId: 'ba3',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.BARNETRYGD,
    bruker: bruker,
    behandlinger: behandlinger_3,
    språkkode: Målform.NB,
};

export { fagsak_ba3 };
