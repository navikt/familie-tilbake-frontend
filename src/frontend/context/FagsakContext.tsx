import * as React from 'react';

import createUseContext from 'constate';

import { byggSuksessRessurs, kjønnType, Ressurs } from '@navikt/familie-typer';

import { Ytelsetype } from '../kodeverk/ytelsetype';
import { IFagsak } from '../typer/fagsak';

const personIdent = '12345600001';
const brukerMock = {
    navn: 'Test Testesen',
    kjønn: kjønnType.UKJENT,
    fødselsdato: '1990-01-01',
    personIdent: personIdent,
};

const fagsakMock = {
    søkerFødselsnummer: personIdent,
    behandlinger: [
        { id: '2', eksternBrukId: '2' },
        { id: '3', eksternBrukId: '3' },
    ],
};

const [FagsakProvider, useFagsak] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<Ressurs<IFagsak>>();

    const hentFagsak = (ytelseType: Ytelsetype, eksternFagsakId: string): void => {
        settFagsak(
            byggSuksessRessurs<IFagsak>({
                ytelseType,
                eksternFagsakId: eksternFagsakId,
                ...fagsakMock,
                bruker: brukerMock,
            })
        );
    };

    return {
        fagsak,
        hentFagsak,
    };
});

export { FagsakProvider, useFagsak };
