import { z } from 'zod';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    Sendt = 'sendt',
    IkkeValgt = '',
}

export enum HarUttaltSeg {
    Ja = 'ja',
    Nei = 'nei',
    UtsettFrist = 'utsett_frist',
    IkkeValgt = '',
}
const fritekstSchema = z
    .string()
    .min(3, 'Du må legge inn minst tre tegn')
    .max(4000, 'Maksimalt 4000 tegn tillatt');

const uttalelsesDetaljerSchema = z.object({
    uttalelsesdato: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    hvorBrukerenUttalteSeg: fritekstSchema,
    uttalelseBeskrivelse: fritekstSchema,
});

const harUttaltSegSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.Ja),
    uttalelsesDetaljer: z.array(uttalelsesDetaljerSchema),
});

const harIkkeUttaltSegSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.Nei),
    kommentar: fritekstSchema,
});

const utsettUttalelseFristSchema = z.object({
    nyFrist: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    begrunnelse: fritekstSchema,
});

const utsettFristSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.UtsettFrist),
    utsettUttalelseFrist: utsettUttalelseFristSchema,
});

const ikkeValgtUttalelseSchema = z.object({
    harUttaltSeg: z.literal(HarUttaltSeg.IkkeValgt),
});

export const uttalelseMedFristSchema = z
    .discriminatedUnion('harUttaltSeg', [
        harUttaltSegSchema,
        harIkkeUttaltSegSchema,
        utsettFristSchema,
        ikkeValgtUttalelseSchema,
    ])
    .refine(data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes',
        path: ['harUttaltSeg'],
    });

export const uttalelseSchema = z
    .discriminatedUnion('harUttaltSeg', [
        harIkkeUttaltSegSchema,
        harUttaltSegSchema,
        ikkeValgtUttalelseSchema,
    ])
    .refine(data => data.harUttaltSeg !== HarUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller ikke',
        path: ['harUttaltSeg'],
    });

export const opprettSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: fritekstSchema,
});

const unntakSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    // begrunnelseForUnntak: z.enum(
    //     ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
    //     { error: 'Du må velge en begrunnelse for unntak' }
    // ),
    // beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000, 'Maksimalt 2000 tegn tillatt'),
});

const ikkeValgtSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [opprettSchema, unntakSchema, ikkeValgtSchema])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
export type UttalelseMedFristFormData = z.infer<typeof uttalelseMedFristSchema>;
