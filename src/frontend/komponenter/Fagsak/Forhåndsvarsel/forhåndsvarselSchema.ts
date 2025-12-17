import { z } from 'zod';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    Sendt = 'sendt',
    IkkeValgt = '',
}

export enum HarBrukerUttaltSeg {
    Ja = 'ja',
    Nei = 'nei',
    UtsettFrist = 'utsett_frist',
    IkkeValgt = '',
}
const fritekstSchema = z
    .string()
    .min(3, 'Du må legge inn minst tre tegn')
    .max(4000, 'Maksimalt 4000 tegn tillatt');

const brukerHarIkkeUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Nei),
    kommentar: fritekstSchema,
});

const uttalelsesDetaljerSchema = z.object({
    uttalelsesdato: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    hvorBrukerenUttalteSeg: fritekstSchema,
    uttalelseBeskrivelse: fritekstSchema,
});

const brukerHarUttaltSegSchema = z.object({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Ja),
    uttalelsesDetaljer: z.array(uttalelsesDetaljerSchema),
});

const utsettUttalelseFristSchema = z.object({
    nyFrist: z.iso.date({ error: 'Du må legge inn en gyldig dato' }),
    begrunnelse: fritekstSchema,
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
    fritekst: fritekstSchema,
});

const uttalelseSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Sendt),
    harBrukerUttaltSeg: harBrukerUttaltSegSchema,
});

const unntakSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    // begrunnelseForUnntak: z.enum(
    //     ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
    //     { error: 'Du må velge en begrunnelse for unntak' }
    // ),
    // beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000, 'Maksimalt 2000 tegn tillatt'),
    harBrukerUttaltSeg: harBrukerUttaltSegUtenUtsettFristSchema,
});

const ikkeValgtSchema = z.object({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [
        opprettSchema,
        uttalelseSchema,
        unntakSchema,
        ikkeValgtSchema,
    ])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
