import * as React from 'react';

import createUseContext from 'constate';

import { kjønnType } from '@navikt/familie-typer';

import { IFagsak } from '../typer/fagsak';
import { IPerson } from '../typer/person';

export const brukerMock = {
    navn: 'Test Testesen',
    kjønn: kjønnType.UKJENT,
    alder: 22,
};

const [FagsakProvider, useFagsakRessurser] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<IFagsak>();
    const [bruker, settBruker] = React.useState<IPerson>();

    const settSak = (fagsak: IFagsak): void => {
        settFagsak(fagsak);
    };

    const settPerson = (person: IPerson): void => {
        settBruker(person);
    };

    return {
        bruker,
        fagsak,
        settSak,
        settPerson,
    };
});

export { FagsakProvider, useFagsakRessurser };
