import type { FagsakDto } from '../generated';
import type { Bruker } from '../typer/bruker';
import type { Fagsak } from '../typer/fagsak';

import { Fagsystem, Ytelsetype } from '../kodeverk';
import { Kjønn } from '../typer/bruker';
import { Målform } from '../typer/fagsak';

export const lagFagsak = (overrides: Partial<Fagsak> = {}): Fagsak => ({
    eksternFagsakId: 'id-1',
    ytelsestype: Ytelsetype.Overgangsstønad,
    fagsystem: Fagsystem.EF,
    språkkode: Målform.Nb,
    bruker: lagBruker(),
    behandlinger: [],
    institusjon: null,
    ...overrides,
});

const lagBruker = (overrides: Partial<Bruker> = {}): Bruker => ({
    navn: 'Test Bruker',
    personIdent: '12345678901',
    dødsdato: null,
    fødselsdato: '1990-01-01',
    kjønn: Kjønn.Kvinne,
    ...overrides,
});

//TODO: Skal fjernes når vi tar i bruk FagsakDto over
export const lagFagsakDto = (overrides: Partial<FagsakDto> = {}): FagsakDto =>
    ({
        ...lagFagsak(),
        ...overrides,
    }) as FagsakDto;
