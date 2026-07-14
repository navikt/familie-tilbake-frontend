import { z } from 'zod';

import { zDelerWritable, zJaSaerligeGrunnerWritable } from '@/generated-new/zod.gen';

/**
 * Form-schema for vilkårsvurderingen.
 *
 * Schemaet speiler skjemaets state-form (alle grener er montert samtidig, med
 * tomme sentinelverdier for uvalgte diskriminatorer), ikke backend-kontrakten.
 * Kontrakten (POST-body) er en discriminated union der kun den valgte grenen
 * finnes – den mappes fra denne formen ved innsending og valideres da mot
 * `zVilkaarsvurderingWritable`.
 *
 * Der tallgrenser finnes i kontrakten gjenbrukes de fra de genererte zod-blokkene
 * (`@/generated-new/zod.gen`) i stedet for å dupliseres her.
 */

const valgSchema = z.enum(['forsto_eller_burde_forstått', 'forårsaket_av_mottaker', 'god_tro', '']);

const aktsomhetValgSchema = z.enum(['uaktsomt', 'grovtUaktsomt', 'forsettlig', '']);

const beløpIBeholdValgSchema = z.enum(['ingenting', 'hele', 'deler', '']);

const erDetSærligeGrunnerValgSchema = z.enum(['ja', 'nei', '']);

/** Gjenbruker uint8-grensen (0–255) fra kontrakten for prosentReduksjon. */
const prosentReduksjonSchema = zJaSaerligeGrunnerWritable.shape.prosentReduksjon.nullable();

/** Gjenbruker uint32-grensen fra kontrakten for beløp i behold. */
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
            begrunnelseIBehold: z.string(),
        }),
        deler: z.object({
            beløpIBehold: beløpIBeholdKronerSchema,
            begrunnelseIBehold: z.string(),
        }),
    }),
});

export type VilkårValg = z.infer<typeof valgSchema>;
export type AktsomhetValg = z.infer<typeof aktsomhetValgSchema>;
export type BeløpIBeholdValg = z.infer<typeof beløpIBeholdValgSchema>;
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
