import type { HarBrukerUttaltSeg } from './Enums';
import type { Uttalelsesdetaljer } from '../../../generated';

import { z } from 'zod';

export enum SkalSendesForhåndsvarsel {
    Ja = 'ja',
    Nei = 'nei',
    IkkeValgt = 'ikkeValgt',
}

const baseFields = z.object({
    skalSendesForhåndsvarsel: z.string(),
    fritekst: z.string(),
    harBrukerUttaltSeg: z.custom<HarBrukerUttaltSeg>(),
    uttalelsesKommentar: z.string(),
    uttalelsesDetaljer: z.union([z.array(z.custom<Uttalelsesdetaljer>()), z.string()]),
    uttalelsesdato: z.string(),
    hvorBrukerenUttalteSeg: z.string(),
    uttalelseBeskrivelse: z.string(),
    nyFristDato: z.string(),
    begrunnelseUtsattFrist: z.string(),
});

const opprettSchema = baseFields.extend({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Ja),
    fritekst: z.string().min(3, 'Du må legge inn minst tre tegn').max(4000),
});

const unntakSchema = baseFields.extend({
    skalSendesForhåndsvarsel: z.literal(SkalSendesForhåndsvarsel.Nei),
    begrunnelseForUnntak: z.enum(
        ['IkkePraktiskMulig', 'UrimeligRessurskrevende', 'ÅpenbartUnødvendig'],
        { error: 'Du må velge en begrunnelse for unntak' }
    ),
    beskrivelse: z.string().min(3, 'Du må legge inn minst tre tegn').max(2000),
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
