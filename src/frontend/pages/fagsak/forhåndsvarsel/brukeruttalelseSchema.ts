import type { DefaultValues } from 'react-hook-form';
import type { UttalelseVurdering } from '@/generated-new';

import { z } from 'zod';

const fritekst = z.string().trim().min(1).max(4000);

const harUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal('JA'),
    uttalelsesdato: z.iso.date(),
    hvorBrukerenUttalteSeg: fritekst,
    beskrivelse: fritekst,
});

const harIkkeUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal('NEI'),
    kommentar: fritekst,
});

export const brukeruttalelseFelter = z.discriminatedUnion(
    'harBrukerUttaltSeg',
    [harUttaltSegSchema, harIkkeUttaltSegSchema],
    { message: 'Du må velge om brukeren har uttalt seg' }
);

export const brukeruttalelseSchema = z.object({ brukeruttalelse: brukeruttalelseFelter });

export type BrukeruttalelseFelter = z.infer<typeof brukeruttalelseFelter>;
export type BrukeruttalelseFormData = z.infer<typeof brukeruttalelseSchema>;

export const tilUttalelseSkjema = (
    uttalelse: UttalelseVurdering | null
): DefaultValues<BrukeruttalelseFelter> | undefined => {
    switch (uttalelse?.harBrukerUttaltSeg) {
        case 'JA':
        case 'NEI':
            return uttalelse;
        case 'HAR_TIDLIGERE_VURDERING': {
            const { uttalelsesdato, hvorBrukerenUttalteSeg, beskrivelse } = uttalelse;
            return { uttalelsesdato, hvorBrukerenUttalteSeg, beskrivelse };
        }
        default:
            return undefined;
    }
};
