import type { FagsakDto, FrontendBrukerDto } from '../generated';

import { Fagsystem, Ytelsetype } from '../kodeverk';
import { Kjønn } from '../typer/bruker';
import { Målform } from '../typer/målform';

export const lagFagsak = (overrides: Partial<FagsakDto> = {}): FagsakDto => ({
    eksternFagsakId: 'id-1',
    ytelsestype: Ytelsetype.Overgangsstønad,
    fagsystem: Fagsystem.EF,
    språkkode: Målform.Nb,
    bruker: lagBruker(),
    behandlinger: [],
    institusjon: undefined,
    ...overrides,
});

const lagBruker = (overrides: Partial<FrontendBrukerDto> = {}): FrontendBrukerDto => ({
    navn: 'Test Bruker',
    personIdent: '12345678901',
    dødsdato: undefined,
    fødselsdato: '1990-01-01',
    kjønn: Kjønn.Kvinne,
    ...overrides,
});

export const lagFagsakDto = lagFagsak;
