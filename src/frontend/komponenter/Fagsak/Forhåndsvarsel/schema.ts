import { z } from 'zod';

import { HarBrukerUttaltSeg } from './Enums';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = 'ikkeValgt',
}

const brukerHarIkkeUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Nei),
    kommentar: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const uttalelsesDetaljerSchema = z.object({
    uttalelsesdato: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    hvorBrukerenUttalteSeg: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
    uttalelseBeskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const brukerHarUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Ja),
    uttalelsesDetaljer: z.array(uttalelsesDetaljerSchema),
});

const utsettUttalelseFristSchema = z.object({
    nyFrist: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    begrunnelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const utsettFristSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.UtsettFrist),
    utsettUttalelseFrist: utsettUttalelseFristSchema,
});

const ikkeValgtBrukerUttalelseSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.IkkeValgt),
});

const harBrukerUttaltSegSchema = z
    .discriminatedUnion('harBrukerUttaltSeg', [
        brukerHarIkkeUttaltSegSchema,
        brukerHarUttaltSegSchema,
        utsettFristSchema,
        ikkeValgtBrukerUttalelseSchema,
    ])
    .refine(data => data.harBrukerUttaltSeg !== HarBrukerUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes',
        path: ['harBrukerUttaltSeg'],
    });

const harBrukerUttaltSegUtenUtsettFristSchema = z
    .discriminatedUnion('harBrukerUttaltSeg', [
        brukerHarIkkeUttaltSegSchema,
        brukerHarUttaltSegSchema,
        ikkeValgtBrukerUttalelseSchema,
    ])
    .refine(data => data.harBrukerUttaltSeg !== HarBrukerUttaltSeg.IkkeValgt, {
        message: 'Du må velge om brukeren har uttalt seg eller ikke',
        path: ['harBrukerUttaltSeg'],
    });

const opprettSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
    harBrukerUttaltSeg: harBrukerUttaltSegSchema,
});

const unntakSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    // begrunnelseForUnntak: z.enum(
    //     ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
    //     { error: 'Du må velge en begrunnelse for unntak' }
    // ),
    // beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000),
    harBrukerUttaltSeg: harBrukerUttaltSegUtenUtsettFristSchema,
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
