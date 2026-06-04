import type { Uttalelse } from '@/generated-new';

import { z } from 'zod';

const fritekst = z.string().trim().min(1).max(4000);

const harUttaltSegSchema = z.object({
    harUttaltSeg: z.literal('ja'),
    uttalelsesdato: z.iso.date(),
    hvorBrukerenUttalteSeg: fritekst,
    beskrivelse: fritekst,
});

const harIkkeUttaltSegSchema = z.object({
    harUttaltSeg: z.literal('nei'),
    beskrivelse: fritekst,
});

export const brukeruttalelseFelter = z.discriminatedUnion(
    'harUttaltSeg',
    [harUttaltSegSchema, harIkkeUttaltSegSchema],
    { message: 'Du må velge om brukeren har uttalt seg' }
);

export const brukeruttalelseSchema = z.object({ brukeruttalelse: brukeruttalelseFelter });

export type BrukeruttalelseFelter = z.infer<typeof brukeruttalelseFelter>;
export type BrukeruttalelseFormData = z.infer<typeof brukeruttalelseSchema>;

type UttalelseScenario = 'sendt' | 'unntak';

export const tilUttalelsePayload = (
    felter: BrukeruttalelseFelter,
    kontekst: UttalelseScenario
): Uttalelse =>
    felter.harUttaltSeg === 'ja'
        ? {
              harBrukerUttaltSeg:
                  kontekst === 'sendt' ? 'JA_ETTER_FORHÅNDSVARSEL' : 'UNNTAK_ALLEREDE_UTTALT_SEG',
              uttalelsesdato: felter.uttalelsesdato,
              hvorBrukerenUttalteSeg: felter.hvorBrukerenUttalteSeg,
              beskrivelse: felter.beskrivelse,
          }
        : {
              harBrukerUttaltSeg:
                  kontekst === 'sendt' ? 'NEI_ETTER_FORHÅNDSVARSEL' : 'UNNTAK_INGEN_UTTALELSE',
              beskrivelse: felter.beskrivelse,
          };

export const tilUttalelseSkjema = (
    uttalelse: Uttalelse | null
): BrukeruttalelseFelter | undefined => {
    switch (uttalelse?.harBrukerUttaltSeg) {
        case 'JA_ETTER_FORHÅNDSVARSEL':
        case 'UNNTAK_ALLEREDE_UTTALT_SEG':
            return {
                harUttaltSeg: 'ja',
                uttalelsesdato: uttalelse.uttalelsesdato ?? '',
                hvorBrukerenUttalteSeg: uttalelse.hvorBrukerenUttalteSeg ?? '',
                beskrivelse: uttalelse.beskrivelse ?? '',
            };
        case 'NEI_ETTER_FORHÅNDSVARSEL':
        case 'UNNTAK_INGEN_UTTALELSE':
            return { harUttaltSeg: 'nei', beskrivelse: uttalelse.beskrivelse ?? '' };
        default:
            return undefined;
    }
};
