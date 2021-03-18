import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../../frontend/kodeverk';
import { Behandlingstype, Behandlingstatus } from '../../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling } from '../../../frontend/typer/fagsak';
import { IPerson } from '../../../frontend/typer/person';

export * from './BA_behandling_4';

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
];

const fagsak_ba2: IFagsak = {
    eksternFagsakId: 'ba2',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.BARNETRYGD,
    bruker: bruker,
    behandlinger: behandlinger_2,
};

export { fagsak_ba2 };
