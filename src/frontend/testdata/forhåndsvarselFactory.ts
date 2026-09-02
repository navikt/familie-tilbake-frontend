import type {
    ForhaandsvarselErSendt,
    ForhaandsvarselResponse,
    ForhaandsvarselUnntak,
    Uttalelse,
} from '@/generated-new';

export const lagForhåndsvarselResponse = (
    overrides: Partial<ForhaandsvarselResponse> = {}
): ForhaandsvarselResponse => ({
    forhaandsvarselSteg: { type: 'ikke_vurdert' },
    brukeruttalelse: null,
    ...overrides,
});

export const lagForhåndsvarselResponseSendt = (
    steg: Partial<ForhaandsvarselErSendt> = {},
    overrides: Partial<ForhaandsvarselResponse> = {}
): ForhaandsvarselResponse =>
    lagForhåndsvarselResponse({
        forhaandsvarselSteg: {
            type: 'sendt',
            ferdigvurdert: true,
            forhåndsvarselInfo: {
                tekstFraSaksbehandler: 'Varselbrev er sendt',
                varselbrevSendtTid: '2025-01-10T10:00:00Z',
            },
            uttalelsesfrist: {
                opprinneligFrist: '2025-01-22',
            },
            ...steg,
        },
        ...overrides,
    });

export const lagForhåndsvarselResponseUnntak = (
    steg: Partial<ForhaandsvarselUnntak> = {},
    overrides: Partial<ForhaandsvarselResponse> = {}
): ForhaandsvarselResponse =>
    lagForhåndsvarselResponse({
        forhaandsvarselSteg: {
            type: 'unntak',
            ferdigvurdert: false,
            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
            beskrivelse: 'Det er åpenbart unødvendig å varsle bruker.',
            ...steg,
        },
        ...overrides,
    });

export const lagUttalelse = (overrides: Partial<Uttalelse> = {}): Uttalelse => ({
    harBrukerUttaltSeg: 'JA_ETTER_FORHÅNDSVARSEL',
    uttalelsesdato: '2025-01-20',
    hvorBrukerenUttalteSeg: 'Telefon',
    beskrivelse: 'Bruker er uenig i vedtaket.',
    ...overrides,
});
