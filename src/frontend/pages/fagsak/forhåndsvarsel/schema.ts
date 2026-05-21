import { z } from 'zod';

import { zVarslingsunntak } from '~/generated-new/zod.gen';

const sendSchema = z.object({
    valg: z.literal('send'),
    tekstFraSaksbehandler: z.string().trim().min(1).max(4000),
});

const unntakSchema = z.object({
    valg: z.literal('unntak'),
    begrunnelseForUnntak: z.enum(zVarslingsunntak.options, {
        error: 'Du må velge en begrunnelse for unntak fra forhåndsvarsel',
    }),
    beskrivelse: z.string().trim().min(1).max(2000),
});

export const ikkeVurdertSchema = z.discriminatedUnion('valg', [sendSchema, unntakSchema], {
    message: 'Du må velge om det skal sendes forhåndsvarsel',
});

export type IkkeVurdertFormData = z.infer<typeof ikkeVurdertSchema>;
