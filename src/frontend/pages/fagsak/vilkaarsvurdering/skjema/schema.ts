import { z } from 'zod';

import {
    zDelerWritable,
    zJaSaerligeGrunnerWritable,
    zSkalReduseresWritable,
} from '@/generated-new/zod.gen';

const valgSchema = z.enum(['forsto_eller_burde_forstått', 'forårsaket_av_mottaker', 'god_tro', '']);

const aktsomhetValgSchema = z.enum(['uaktsomt', 'grovtUaktsomt', 'forsettlig', '']);

const beløpIBeholdValgSchema = z.enum(['ingenting', 'hele', 'deler', '']);

const erDetSærligeGrunnerValgSchema = z.enum(['ja', 'nei', '']);

const prosentReduksjonSchema = zJaSaerligeGrunnerWritable.shape.prosentReduksjon.nullable();

const beløpIBeholdKronerSchema = zDelerWritable.shape.beløp.nullable();

const særligeGrunnerSchema = z.object({
    erDetSærligeGrunner: erDetSærligeGrunnerValgSchema,
    særligeGrunnerFor: z.array(z.string()),
    særligeGrunnerMot: z.array(z.string()),
    begrunnelse: z.string(),
    annetBegrunnelse: z.string(),
    prosentReduksjon: prosentReduksjonSchema,
});

const medBegrunnelseOgSærligeGrunner = z.object({
    begrunnelse: z.string(),
    særligeGrunner: særligeGrunnerSchema,
});

const reduksjonValgSchema = z.enum(['skalReduseres', 'skalIkkeReduseres', '']);

const skalKrevesTilbakeBeløpSchema = zSkalReduseresWritable.shape.beløp.nullable();

const reduksjonFelter: {
    reduksjon: typeof reduksjonValgSchema;
    skalReduseres: z.ZodObject<{
        beløp: typeof skalKrevesTilbakeBeløpSchema;
        relevans: z.ZodArray<z.ZodString>;
        annetBegrunnelse: z.ZodString;
        begrunnelse: z.ZodString;
    }>;
    skalIkkeReduseres: z.ZodObject<{
        relevans: z.ZodArray<z.ZodString>;
        annetBegrunnelse: z.ZodString;
        begrunnelse: z.ZodString;
    }>;
} = {
    reduksjon: reduksjonValgSchema,
    skalReduseres: z.object({
        beløp: skalKrevesTilbakeBeløpSchema,
        relevans: z.array(z.string()),
        annetBegrunnelse: z.string(),
        begrunnelse: z.string(),
    }),
    skalIkkeReduseres: z.object({
        relevans: z.array(z.string()),
        annetBegrunnelse: z.string(),
        begrunnelse: z.string(),
    }),
};

export const vilkårsvurderingSkjema = z.object({
    id: z.string(),
    valg: valgSchema,
    forstoEllerBurdeForstått: z.object({
        forsto: medBegrunnelseOgSærligeGrunner,
        burdeForstått: medBegrunnelseOgSærligeGrunner,
    }),
    forårsaketAvMottaker: z.object({
        aktsomhet: aktsomhetValgSchema,
        uaktsomt: medBegrunnelseOgSærligeGrunner,
        grovtUaktsomt: medBegrunnelseOgSærligeGrunner,
        forsettlig: z.object({
            begrunnelse: z.string(),
        }),
    }),
    godTro: z.object({
        begrunnelse: z.string(),
        beløpIBehold: beløpIBeholdValgSchema,
        ingenting: z.object({
            begrunnelse: z.string(),
        }),
        hele: z.object({
            begrunnelse: z.string(),
            ...reduksjonFelter,
        }),
        deler: z.object({
            beløp: beløpIBeholdKronerSchema,
            begrunnelse: z.string(),
            ...reduksjonFelter,
        }),
    }),
});

export type VilkårValg = z.infer<typeof valgSchema>;
export type AktsomhetValg = z.infer<typeof aktsomhetValgSchema>;
export type BeløpIBeholdValg = z.infer<typeof beløpIBeholdValgSchema>;
export type ReduksjonValg = z.infer<typeof reduksjonValgSchema>;
export type ErDetSærligeGrunnerValg = z.infer<typeof erDetSærligeGrunnerValgSchema>;
export type SærligeGrunnerFelter = z.infer<typeof særligeGrunnerSchema>;
export type VilkårsvurderingSkjemaFelter = z.infer<typeof vilkårsvurderingSkjema>;

/**
 * Feltstier hvor SærligeGrunner-komponenten registreres i skjemaet.
 * Brukes som `navnPrefix` slik at komponenten kan gjenbrukes på tvers av grenene.
 */
export type SærligeGrunnerNavnPrefix =
    | 'forstoEllerBurdeForstått.forsto.særligeGrunner'
    | 'forstoEllerBurdeForstått.burdeForstått.særligeGrunner'
    | 'forårsaketAvMottaker.uaktsomt.særligeGrunner'
    | 'forårsaketAvMottaker.grovtUaktsomt.særligeGrunner';

/**
 * Feltstier hvor Reduksjon-komponenten registreres i skjemaet.
 * Brukes som `navnPrefix` slik at komponenten kan gjenbrukes på tvers av grenene.
 */
export type ReduksjonNavnPrefix = 'godTro.hele' | 'godTro.deler';
