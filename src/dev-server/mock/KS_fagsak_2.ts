import { kjønnType } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../../frontend/kodeverk';
import { Behandlingstype, Behandlingstatus } from '../../frontend/typer/behandling';
import { IFagsak, IFagsakBehandling } from '../../frontend/typer/fagsak';
import { IPerson } from '../../frontend/typer/person';

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

export { fagsak_ks2 };
