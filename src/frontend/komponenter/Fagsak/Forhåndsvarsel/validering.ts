import { z } from 'zod';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = 'ikkeValgt',
}

const jaSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const neiSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    begrunnelseForUnntak: z.enum(
        ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
        { error: 'Du må velge en begrunnelse for unntak' }
    ),
    beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000),
});

const ikkeValgtSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [jaSchema, neiSchema, ikkeValgtSchema])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
