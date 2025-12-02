import { z } from 'zod';

import { SkalSendesForhåndsvarsel } from './Forhåndsvarsel';

export const forhåndsvarselJaSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: z.string().min(1, 'Du må legge til en tekst').max(4000),
});

export const forhåndsvarselNeiSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    begrunnelseForUnntak: z.enum([
        'IkkePraktiskMulig',
        'UrimeligRessurskrevende',
        'ÅpenbartUnødvendig',
    ]),
    beskrivelse: z.string().min(1, 'Forklar hvorfor forhåndsvarselet ikke skal sendes').max(2000),
});

export const forhåndsvarselSchema = z.discriminatedUnion('skalSendesForhåndsvarsel', [
    forhåndsvarselJaSchema,
    forhåndsvarselNeiSchema,
]);

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
