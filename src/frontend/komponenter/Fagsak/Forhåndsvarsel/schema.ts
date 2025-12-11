import type { Uttalelsesdetaljer } from '../../../generated';

import { z } from 'zod';

import { HarBrukerUttaltSeg } from './Enums';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = 'ikkeValgt',
}

const baseFields = z.object({
    skalSendesForhåndsvarsel: z.string(),
    fritekst: z.string(),
    harBrukerUttaltSeg: z.string(),
    uttalelsesKommentar: z.string(),
    uttalelsesDetaljer: z.union([z.array(z.custom<Uttalelsesdetaljer>()), z.string()]),
    uttalelsesdato: z.string(),
    hvorBrukerenUttalteSeg: z.string(),
    uttalelseBeskrivelse: z.string(),
    nyFristDato: z.string(),
    begrunnelseUtsattFrist: z.string(),
});

const brukerharIkkeUttaltSegSchema = baseFields.extend({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Nei),
    uttalelsesKommentar: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const brukerharUttaltSegSchema = baseFields.extend({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.Ja),
    uttalelsesdato: z.string(),
    hvorBrukerenUttalteSeg: z.string(),
    uttalelseBeskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const utsettFristSchema = baseFields.extend({
    harBrukerUttaltSeg: z.literal(HarBrukerUttaltSeg.UtsettFrist),
    nyFristDato: z.string(),
    begrunnelseUtsattFrist: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const harBrukerUttaltSegSchema = z
    .unknown()
    .refine(data => data !== undefined && data !== null, {
        message: 'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes',
    })
    .pipe(
        z.discriminatedUnion('harBrukerUttaltSeg', [
            brukerharIkkeUttaltSegSchema,
            brukerharUttaltSegSchema,
            utsettFristSchema,
        ])
    );

const harBrukerUttaltSegUtenUtsettFristSchema = z
    .unknown()
    .refine(data => data !== undefined && data !== null, {
        message: 'Du må velge om brukeren har uttalt seg eller ikke',
    })
    .pipe(
        z.discriminatedUnion('harBrukerUttaltSeg', [
            brukerharIkkeUttaltSegSchema,
            brukerharUttaltSegSchema,
        ])
    );

const opprettSchema = baseFields.extend({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
    harBrukerUttaltSeg: harBrukerUttaltSegSchema,
});

const unntakSchema = baseFields.extend({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    begrunnelseForUnntak: z.enum(
        ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
        { error: 'Du må velge en begrunnelse for unntak' }
    ),
    beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000),
    harBrukerUttaltSeg: harBrukerUttaltSegUtenUtsettFristSchema,
});

const ikkeValgtSchema = baseFields.extend({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.IkkeValgt),
});

export const forhåndsvarselSchema = z
    .discriminatedUnion('skalSendesForhåndsvarsel', [opprettSchema, unntakSchema, ikkeValgtSchema])
    .refine(data => data.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.IkkeValgt, {
        message: 'Du må velge om forhåndsvarselet skal sendes eller ikke',
        path: ['skalSendesForhåndsvarsel'],
    });

export type ForhåndsvarselFormData = z.infer<typeof forhåndsvarselSchema>;
