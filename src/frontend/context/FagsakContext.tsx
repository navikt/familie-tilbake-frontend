import * as React from 'react';

import createUseContext from 'constate';

import { kjønnType } from '@navikt/familie-typer';

import { IFagsak } from '../typer/fagsak';
import { IPerson } from '../typer/person';

const brukerMock = {
    navn: 'Test Testesen',
    kjønn: kjønnType.UKJENT,
    alder: 22,
};

const [FagsakProvider, useFagsakRessurser] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<IFagsak>();
    const [bruker, settBruker] = React.useState<IPerson>();

    const hentFagsak = (fagsakId: string): void => {
        settFagsak({ id: fagsakId, fagsakId: fagsakId, søkerFødselsnummer: '12345610001' });
    };

    const hentBruker = (personIdent: string): void => {
        settBruker({ personIdent, ...brukerMock });
    };

    return {
        bruker,
        fagsak,
        hentBruker,
        hentFagsak,
    };
});

export { FagsakProvider, useFagsakRessurser };
