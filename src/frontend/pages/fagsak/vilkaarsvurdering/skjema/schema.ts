import { z } from 'zod';

import {
    zDelerWritable,
    zJaSaerligeGrunnerWritable,
    zSkalReduseresWritable,
} from '@/generated-new/zod.gen';

const valgSchema = z.enum(['forsto_eller_burde_forstått', 'forårsaket_av_mottaker', 'god_tro', '']);

const forståelseValgSchema = z.enum(['forsto', 'burdeForstått', '']);

const aktsomhetValgSchema = z.enum(['uaktsomt', 'grovtUaktsomt', 'forsettlig', '']);

const beløpIBeholdValgSchema = z.enum(['ingenting', 'hele', 'deler', '']);

const erDetSærligeGrunnerValgSchema = z.enum(['ja', 'nei', '']);

const prosentReduksjonSchema = zJaSaerligeGrunnerWritable.shape.prosentReduksjon.nullable();

const beløpIBeholdKronerSchema = zDelerWritable.shape.beløp.nullable();

const jaSærligeGrunnerSchema = z.object({
    særligeGrunnerFor: z.array(z.string()),
    prosentReduksjon: prosentReduksjonSchema,
    begrunnelse: z.string(),
    annetBegrunnelse: z.string(),
});

const neiSærligeGrunnerSchema = z.object({
    særligeGrunnerMot: z.array(z.string()),
    begrunnelse: z.string(),
    annetBegrunnelse: z.string(),
});

const særligeGrunnerSchema = z.object({
    erDetSaerligeGrunner: erDetSærligeGrunnerValgSchema,
    jaSærligeGrunner: jaSærligeGrunnerSchema,
    neiSærligeGrunner: neiSærligeGrunnerSchema,
});

const unnlatelseValgSchema = z.enum(['skalUnnlates', 'skalIkkeUnnlates', 'ikkeAktuelt', '']);

const unnlatelseSchema = z.object({
    unnlatelse: unnlatelseValgSchema,
    skalUnnlates: z.object({
        begrunnelse: z.string(),
    }),
    skalIkkeUnnlates: z.object({
        begrunnelse: z.string(),
        erDetSærligeGrunner: særligeGrunnerSchema,
    }),
    ikkeAktuelt: z.object({
        erDetSærligeGrunner: særligeGrunnerSchema,
    }),
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
    simulertBeløp: z.number().nullable(),
    valg: valgSchema,
    forstoEllerBurdeForstått: z.object({
        forståelse: forståelseValgSchema,
        forsto: z.object({
            begrunnelse: z.string(),
            unnlatelse: unnlatelseSchema,
        }),
        burdeForstått: z.object({
            begrunnelse: z.string(),
            unnlatelse: unnlatelseSchema,
        }),
    }),
    forårsaketAvMottaker: z.object({
        aktsomhet: aktsomhetValgSchema,
        uaktsomt: z.object({
            begrunnelse: z.string(),
            unnlatelse: unnlatelseSchema,
        }),
        grovtUaktsomt: z.object({
            begrunnelse: z.string(),
            erDetSærligeGrunner: særligeGrunnerSchema,
        }),
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
export type ForståelseValg = z.infer<typeof forståelseValgSchema>;
export type AktsomhetValg = z.infer<typeof aktsomhetValgSchema>;
export type BeløpIBeholdValg = z.infer<typeof beløpIBeholdValgSchema>;
export type ReduksjonValg = z.infer<typeof reduksjonValgSchema>;
export type ErDetSærligeGrunnerValg = z.infer<typeof erDetSærligeGrunnerValgSchema>;
export type SærligeGrunnerFelter = z.infer<typeof særligeGrunnerSchema>;
export type UnnlatelseFelter = z.infer<typeof unnlatelseSchema>;
export type VilkårsvurderingSkjemaFelter = z.infer<typeof vilkårsvurderingSkjema>;

/**
 * Feltstier til `unnlatelse`-objektet i skjemaet. Brukes som `navnPrefix` slik at
 * Under4xRettsgebyr-komponenten kan bygge stiene til grenene (`skalUnnlates`,
 * `skalIkkeUnnlates`).
 */
export type UnnlatelseNavnPrefix =
    | 'forstoEllerBurdeForstått.forsto.unnlatelse'
    | 'forstoEllerBurdeForstått.burdeForstått.unnlatelse'
    | 'forårsaketAvMottaker.uaktsomt.unnlatelse';

/**
 * Feltstier hvor SærligeGrunner-komponenten registreres i skjemaet.
 * Brukes som `navnPrefix` slik at komponenten kan gjenbrukes på tvers av grenene.
 */
export type SærligeGrunnerNavnPrefix =
    | `${UnnlatelseNavnPrefix}.ikkeAktuelt.erDetSærligeGrunner`
    | `${UnnlatelseNavnPrefix}.skalIkkeUnnlates.erDetSærligeGrunner`
    | 'forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner';

/**
 * Feltstier hvor Reduksjon-komponenten registreres i skjemaet.
 * Brukes som `navnPrefix` slik at komponenten kan gjenbrukes på tvers av grenene.
 */
export type ReduksjonNavnPrefix = 'godTro.hele' | 'godTro.deler';
