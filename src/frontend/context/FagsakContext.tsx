import * as React from 'react';

import createUseContext from 'constate';

import { byggSuksessRessurs, kjønnType, Ressurs } from '@navikt/familie-typer';

import { Fagsystem, Ytelsetype } from '../kodeverk';
import { Behandlingstatus, Behandlingstype } from '../typer/behandling';
import { IFagsak } from '../typer/fagsak';

const personIdent = '12345600001';
const brukerMock = {
    navn: 'Test Testesen',
    kjønn: kjønnType.UKJENT,
    fødselsdato: '1990-01-01',
    personIdent: personIdent,
};

const fagsakMock = {
    behandlinger: [
        {
            id: '2',
            eksternBrukId: '2',
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            status: Behandlingstatus.OPPRETTET,
        },
        {
            id: '3',
            eksternBrukId: '3',
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            status: Behandlingstatus.OPPRETTET,
        },
        {
            id: '4',
            eksternBrukId: '4',
            type: Behandlingstype.REVURDERING_TILBAKEKREVING,
            status: Behandlingstatus.OPPRETTET,
        },
    ],
};

const mockYtelsetype = (fagsystem: Fagsystem): Ytelsetype => {
    switch (fagsystem) {
        case Fagsystem.BA:
            return Ytelsetype.BARNETRYGD;
        case Fagsystem.EF:
            return Ytelsetype.OVERGANGSSTØNAD;
        case Fagsystem.KS:
            return Ytelsetype.KONTANTSTØTTE;
    }
};

const [FagsakProvider, useFagsak] = createUseContext(() => {
    const [fagsak, settFagsak] = React.useState<Ressurs<IFagsak>>();

    const hentFagsak = (fagsystem: Fagsystem, eksternFagsakId: string): void => {
        settFagsak(
            byggSuksessRessurs<IFagsak>({
                fagsystem,
                ytelseType: mockYtelsetype(fagsystem),
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
