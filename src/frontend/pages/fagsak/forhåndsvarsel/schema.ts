import { z } from 'zod';

const sendSchema = z.object({
    valg: z.literal('send'),
    tekstFraSaksbehandler: z.string().trim().min(1, 'Du må fylle ut teksten').max(4000),
});

const unntakSchema = z.object({
    valg: z.literal('unntak'),
});

export const ikkeVurdertSchema = z.discriminatedUnion('valg', [sendSchema, unntakSchema], {
    message: 'Du må velge om det skal sendes forhåndsvarsel',
});

export type IkkeVurdertFormData = z.infer<typeof ikkeVurdertSchema>;
