import type { Varselbrevtekst } from '../generated';
import type { UseForhåndsvarselMutationsReturn } from '../komponenter/Fagsak/Forhåndsvarsel/useForhåndsvarselMutations';
import type { UseForhåndsvarselQueriesReturn } from '../komponenter/Fagsak/Forhåndsvarsel/useForhåndsvarselQueries';
import type { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query';

export const lagMockQuery = <T>(data?: T): UseQueryResult<T | undefined> =>
    ({
        data,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        refetch: jest.fn(),
    }) as unknown as UseQueryResult<T | undefined>;

export const lagMockSuspenseQuery = <T>(data: T): UseSuspenseQueryResult<T, Error> =>
    ({
        data,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        refetch: jest.fn(),
    }) as unknown as UseSuspenseQueryResult<T, Error>;

export const lagForhåndsvarselQueries = (
    overrides: Partial<UseForhåndsvarselQueriesReturn> = {}
): UseForhåndsvarselQueriesReturn => ({
    forhåndsvarselInfo: {
        varselbrevSendtTid: undefined,
        utsettUttalelseFrist: [],
        brukeruttalelse: undefined,
    },
    varselbrevtekster: {
        overskrift: 'Nav vurderer om du må betale tilbake overgangsstønad',
        avsnitter: [
            {
                title: 'Dette har skjedd',
                body: 'Test innhold',
            },
        ],
    },
    forhåndsvarselInfoLoading: false,
    varselbrevteksterLoading: false,
    forhåndsvarselInfoError: false,
    varselbrevteksterError: false,
    varselbrevteksterQuery: lagMockQuery<Varselbrevtekst>(),
    ...overrides,
});

export const lagForhåndsvarselQueriesSendt = (
    overrides: Partial<UseForhåndsvarselQueriesReturn> = {}
): UseForhåndsvarselQueriesReturn =>
    lagForhåndsvarselQueries({
        forhåndsvarselInfo: {
            varselbrevSendtTid: '2023-01-01T10:00:00Z',
            utsettUttalelseFrist: [],
            brukeruttalelse: undefined,
        },
        ...overrides,
    });

export type PreNoticeMutations = Omit<
    UseForhåndsvarselMutationsReturn,
    | 'forhåndsvisning'
    | 'sendBrukeruttalelseMutation'
    | 'sendForhåndsvarselMutation'
    | 'sendUtsettUttalelseFristMutation'
>;

export const lagForhåndsvarselMutations = (): UseForhåndsvarselMutationsReturn =>
    ({
        sendForhåndsvarsel: jest.fn(),
        sendBrukeruttalelse: jest.fn(),
        sendUtsettUttalelseFrist: jest.fn(),
        seForhåndsvisning: jest.fn(),
        gåTilNeste: jest.fn(),
        sendForhåndsvarselMutation: lagMockQuery(),
        sendBrukeruttalelseMutation: lagMockQuery(),
        sendUtsettUttalelseFristMutation: lagMockQuery(),
        forhåndsvisning: lagMockQuery(),
    }) as unknown as UseForhåndsvarselMutationsReturn;
