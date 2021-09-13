import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import { Behandlingstype, Behandlingstatus } from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling, Målform } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

export * from './BA_behandling_12';
export * from './BA_behandling_13';
export * from './BA_behandling_14';

const bruker: IPerson = {
    navn: 'Test Testesen',
    kjønn: kjønnType.MANN,
    fødselsdato: '1990-01-01',
    personIdent: '12345600001',
};

const behandlinger_4: IFagsakBehandling[] = [
    {
        behandlingId: 'ba12',
        eksternBrukId: '11',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba13',
        eksternBrukId: '12',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
    {
        behandlingId: 'ba14',
        eksternBrukId: '13',
        type: Behandlingstype.REVURDERING_TILBAKEKREVING,
        status: Behandlingstatus.OPPRETTET,
    },
];

const fagsak_ba4: IFagsak = {
    eksternFagsakId: 'ba4',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.BARNETRYGD,
    bruker: bruker,
    behandlinger: behandlinger_4,
    språkkode: Målform.NB,
};

export { fagsak_ba4 };
