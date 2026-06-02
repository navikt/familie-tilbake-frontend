import type { FagsakDto, FrontendBrukerDto } from '~/generated';

export const lagFagsak = (overrides: Partial<FagsakDto> = {}): FagsakDto => ({
    eksternFagsakId: 'id-1',
    ytelsestype: 'OVERGANGSSTØNAD',
    fagsystem: 'EF',
    språkkode: 'NB',
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
    kjønn: 'KVINNE',
    ...overrides,
});
