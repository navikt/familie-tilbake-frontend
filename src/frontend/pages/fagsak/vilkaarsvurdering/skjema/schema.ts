import { z } from 'zod';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

/**
 * Base-skjemaet validerer kun *formen* på feltene. Verdier som mangler
 * (`undefined`) normaliseres til tomme verdier med `.catch(...)` slik at en
 * inaktiv diskriminert gren ikke gir en kryptisk «Invalid option»-feil før
 * superRefine rekker å avgrense valideringen til den aktive grenen. Selve
 * påkrevd-valideringen skjer i superRefine, og kun for den aktive grenen.
 */
const tekst = z.string().catch('');

const tekstliste = z.array(z.string()).catch([]);

const valgSchema = z
    .enum(['forsto_eller_burde_forstått', 'forårsaket_av_mottaker', 'god_tro', ''])
    .catch('');

const forståelseValgSchema = z.enum(['forsto', 'burdeForstått', '']).catch('');

const aktsomhetValgSchema = z.enum(['uaktsomt', 'grovtUaktsomt', 'forsettlig', '']).catch('');

const beløpIBeholdValgSchema = z.enum(['ingenting', 'hele', 'deler', '']).catch('');

const erDetSærligeGrunnerValgSchema = z.enum(['ja', 'nei', '']).catch('');

const erDetReduksjonÅrsakerGodTroValgSchema = z.enum(['jaGodTro', 'neiGodTro', '']).catch('');

/**
 * Kontrakten tillater 0–255 (uint8), men fagreglene tillater kun 0–100. Grensene
 * ligger i `påkrevdProsent` og ikke her, slik at en verdi utenfor intervallet gir
 * en presis feilmelding i stedet for å bli fanget av `.catch(null)` og rapportert
 * som et manglende felt.
 */
const prosentReduksjonSchema = z.number().nullable().catch(null);

const beløpSchema = z.number().nullable().catch(null);

const jaSærligeGrunnerSchema = z.object({
    særligeGrunnerFor: tekstliste,
    prosentReduksjon: prosentReduksjonSchema,
    begrunnelse: tekst,
    annetBegrunnelse: tekst,
});

const neiSærligeGrunnerSchema = z.object({
    særligeGrunnerMot: tekstliste,
    begrunnelse: tekst,
    annetBegrunnelse: tekst,
});

const særligeGrunnerSchema = z.object({
    erDetReduksjonÅrsaker: erDetSærligeGrunnerValgSchema,
    jaSærligeGrunner: jaSærligeGrunnerSchema,
    neiSærligeGrunner: neiSærligeGrunnerSchema,
});

const unnlatelseValgSchema = z
    .enum(['skalUnnlates', 'skalIkkeUnnlates', 'ikkeAktuelt', ''])
    .catch('');

const unnlatelseSchema = z.object({
    unnlatelse: unnlatelseValgSchema,
    skalUnnlates: z.object({
        begrunnelse: tekst,
    }),
    skalIkkeUnnlates: z.object({
        begrunnelse: tekst,
        erDetSærligeGrunner: særligeGrunnerSchema,
    }),
    ikkeAktuelt: z.object({
        erDetSærligeGrunner: særligeGrunnerSchema,
    }),
});

const reduksjonFelter: {
    erDetReduksjonÅrsaker: typeof erDetReduksjonÅrsakerGodTroValgSchema;
    jaGodTro: z.ZodObject<{
        prosentReduksjon: typeof prosentReduksjonSchema;
        relevans: typeof tekstliste;
        annetBegrunnelse: typeof tekst;
        begrunnelse: typeof tekst;
    }>;
    neiGodTro: z.ZodObject<{
        relevans: typeof tekstliste;
        annetBegrunnelse: typeof tekst;
        begrunnelse: typeof tekst;
    }>;
} = {
    erDetReduksjonÅrsaker: erDetReduksjonÅrsakerGodTroValgSchema,
    jaGodTro: z.object({
        prosentReduksjon: prosentReduksjonSchema,
        relevans: tekstliste,
        annetBegrunnelse: tekst,
        begrunnelse: tekst,
    }),
    neiGodTro: z.object({
        relevans: tekstliste,
        annetBegrunnelse: tekst,
        begrunnelse: tekst,
    }),
};

export const vilkårsvurderingSkjema = z.object({
    id: tekst,
    simulertBeløp: z.number().catch(0).readonly(),
    erVurdert: z.boolean().catch(false),
    valg: valgSchema,
    forstoEllerBurdeForstått: z.object({
        forståelse: forståelseValgSchema,
        forsto: z.object({
            begrunnelse: tekst,
            unnlatelse: unnlatelseSchema,
        }),
        burdeForstått: z.object({
            begrunnelse: tekst,
            unnlatelse: unnlatelseSchema,
        }),
    }),
    forårsaketAvMottaker: z.object({
        aktsomhet: aktsomhetValgSchema,
        uaktsomt: z.object({
            begrunnelse: tekst,
            unnlatelse: unnlatelseSchema,
        }),
        grovtUaktsomt: z.object({
            begrunnelse: tekst,
            erDetSærligeGrunner: særligeGrunnerSchema,
        }),
        forsettlig: z.object({
            begrunnelse: tekst,
        }),
    }),
    godTro: z.object({
        begrunnelse: tekst,
        beløpIBehold: beløpIBeholdValgSchema,
        ingenting: z.object({
            begrunnelse: tekst,
        }),
        hele: z.object({
            begrunnelse: tekst,
            ...reduksjonFelter,
        }),
        deler: z.object({
            beløp: beløpSchema,
            begrunnelse: tekst,
            ...reduksjonFelter,
        }),
    }),
});

export type VilkårValg = z.infer<typeof valgSchema>;
export type ForståelseValg = z.infer<typeof forståelseValgSchema>;
export type AktsomhetValg = z.infer<typeof aktsomhetValgSchema>;
export type BeløpIBeholdValg = z.infer<typeof beløpIBeholdValgSchema>;
export type ReduksjonValg = z.infer<typeof erDetReduksjonÅrsakerGodTroValgSchema>;
export type ErDetSærligeGrunnerValg = z.infer<typeof erDetSærligeGrunnerValgSchema>;
export type SærligeGrunnerFelter = z.infer<typeof særligeGrunnerSchema>;
export type UnnlatelseFelter = z.infer<typeof unnlatelseSchema>;
export type VilkårsvurderingSkjemaFelter = z.infer<typeof vilkårsvurderingSkjema>;
export type ReduksjonFelter = Pick<
    VilkårsvurderingSkjemaFelter['godTro']['hele'],
    'erDetReduksjonÅrsaker' | 'jaGodTro' | 'neiGodTro'
>;

type FeltSti = (string | number)[];

const takFeilmelding = (maksbeløp: number): string =>
    `Beløpet kan ikke være høyere enn det feilutbetalte beløpet på ${formatCurrencyNoKr(maksbeløp)} kroner`;

const påkrevdTekst = z.string().trim().min(1);

const påkrevdBeløp = (maksbeløp: number): z.ZodType<number> => {
    const heltBeløpFeilmelding = 'Du må fylle inn et helt beløp i kroner høyere enn 0';
    return z
        .number()
        .int({ error: heltBeløpFeilmelding })
        .min(1, { error: heltBeløpFeilmelding })
        .max(maksbeløp, { error: takFeilmelding(maksbeløp) });
};
const prosentFeilmelding = 'Du må fylle inn et helt tall mellom 0 og 100';
const påkrevdProsent = z
    .int({ error: prosentFeilmelding })
    .min(0, { error: prosentFeilmelding })
    .max(100, { error: prosentFeilmelding });
const påkrevdValg = z.string().min(1, { error: 'Du må gjøre et valg' });
const påkrevdMinstEtt = z.array(z.string()).min(1, { error: 'Du må velge minst ett alternativ' });

const valider = (
    ctx: z.core.$RefinementCtx,
    schema: z.ZodType,
    verdi: unknown,
    basePath: FeltSti
): void => {
    const resultat = schema.safeParse(verdi);
    if (!resultat.success) {
        for (const issue of resultat.error.issues) {
            ctx.addIssue({ ...issue, path: [...basePath, ...issue.path] });
        }
    }
};

const krevValg = (ctx: z.core.$RefinementCtx, verdi: string, path: FeltSti): void =>
    valider(ctx, påkrevdValg, verdi, path);

const krevTekst = (ctx: z.core.$RefinementCtx, verdi: string, path: FeltSti): void =>
    valider(ctx, påkrevdTekst, verdi, path);

const krevBeløp = (
    ctx: z.core.$RefinementCtx,
    verdi: number | null,
    path: FeltSti,
    maksbeløp: number
): void => valider(ctx, påkrevdBeløp(maksbeløp), verdi, path);

const krevProsent = (ctx: z.core.$RefinementCtx, verdi: number | null, path: FeltSti): void =>
    valider(ctx, påkrevdProsent, verdi, path);

const krevMinstEtt = (ctx: z.core.$RefinementCtx, verdier: string[], path: FeltSti): void =>
    valider(ctx, påkrevdMinstEtt, verdier, path);

const validerSærligeGrunner = (
    ctx: z.core.$RefinementCtx,
    felter: SærligeGrunnerFelter,
    basePath: FeltSti
): void => {
    krevValg(ctx, felter.erDetReduksjonÅrsaker, [...basePath, 'erDetReduksjonÅrsaker']);
    if (felter.erDetReduksjonÅrsaker === 'ja') {
        const path = [...basePath, 'jaSærligeGrunner'];
        krevMinstEtt(ctx, felter.jaSærligeGrunner.særligeGrunnerFor, [
            ...path,
            'særligeGrunnerFor',
        ]);
        if (felter.jaSærligeGrunner.særligeGrunnerFor.includes('ANNET')) {
            krevTekst(ctx, felter.jaSærligeGrunner.annetBegrunnelse, [...path, 'annetBegrunnelse']);
        }
        krevProsent(ctx, felter.jaSærligeGrunner.prosentReduksjon, [...path, 'prosentReduksjon']);
        krevTekst(ctx, felter.jaSærligeGrunner.begrunnelse, [...path, 'begrunnelse']);
    } else if (felter.erDetReduksjonÅrsaker === 'nei') {
        const path = [...basePath, 'neiSærligeGrunner'];
        krevMinstEtt(ctx, felter.neiSærligeGrunner.særligeGrunnerMot, [
            ...path,
            'særligeGrunnerMot',
        ]);
        if (felter.neiSærligeGrunner.særligeGrunnerMot.includes('ANNET')) {
            krevTekst(ctx, felter.neiSærligeGrunner.annetBegrunnelse, [
                ...path,
                'annetBegrunnelse',
            ]);
        }
        krevTekst(ctx, felter.neiSærligeGrunner.begrunnelse, [...path, 'begrunnelse']);
    }
};

const validerReduksjon = (
    ctx: z.core.$RefinementCtx,
    felter: ReduksjonFelter,
    basePath: FeltSti
): void => {
    krevValg(ctx, felter.erDetReduksjonÅrsaker, [...basePath, 'erDetReduksjonÅrsaker']);
    if (felter.erDetReduksjonÅrsaker === 'jaGodTro') {
        const path = [...basePath, 'jaGodTro'];
        krevMinstEtt(ctx, felter.jaGodTro.relevans, [...path, 'relevans']);
        if (felter.jaGodTro.relevans.includes('ANNET')) {
            krevTekst(ctx, felter.jaGodTro.annetBegrunnelse, [...path, 'annetBegrunnelse']);
        }
        krevTekst(ctx, felter.jaGodTro.begrunnelse, [...path, 'begrunnelse']);
        krevProsent(ctx, felter.jaGodTro.prosentReduksjon, [...path, 'prosentReduksjon']);
    } else if (felter.erDetReduksjonÅrsaker === 'neiGodTro') {
        const path = [...basePath, 'neiGodTro'];
        krevMinstEtt(ctx, felter.neiGodTro.relevans, [...path, 'relevans']);
        if (felter.neiGodTro.relevans.includes('ANNET')) {
            krevTekst(ctx, felter.neiGodTro.annetBegrunnelse, [...path, 'annetBegrunnelse']);
        }
        krevTekst(ctx, felter.neiGodTro.begrunnelse, [...path, 'begrunnelse']);
    }
};

const validerUnnlatelse = (
    ctx: z.core.$RefinementCtx,
    felter: UnnlatelseFelter,
    basePath: FeltSti,
    erUnder4xRettsgebyr: boolean
): void => {
    if (erUnder4xRettsgebyr) {
        krevValg(ctx, felter.unnlatelse, [...basePath, 'unnlatelse']);
        if (felter.unnlatelse === 'skalUnnlates') {
            krevTekst(ctx, felter.skalUnnlates.begrunnelse, [
                ...basePath,
                'skalUnnlates',
                'begrunnelse',
            ]);
        } else if (felter.unnlatelse === 'skalIkkeUnnlates') {
            krevTekst(ctx, felter.skalIkkeUnnlates.begrunnelse, [
                ...basePath,
                'skalIkkeUnnlates',
                'begrunnelse',
            ]);
            validerSærligeGrunner(ctx, felter.skalIkkeUnnlates.erDetSærligeGrunner, [
                ...basePath,
                'skalIkkeUnnlates',
                'erDetSærligeGrunner',
            ]);
        }
    } else {
        validerSærligeGrunner(ctx, felter.ikkeAktuelt.erDetSærligeGrunner, [
            ...basePath,
            'ikkeAktuelt',
            'erDetSærligeGrunner',
        ]);
    }
};

const validerFelter = (
    felter: VilkårsvurderingSkjemaFelter,
    ctx: z.core.$RefinementCtx,
    erUnder4xRettsgebyr: boolean,
    feilutbetaltBeløp: number
): void => {
    krevValg(ctx, felter.valg, ['valg']);
    switch (felter.valg) {
        case 'forsto_eller_burde_forstått': {
            const base = ['forstoEllerBurdeForstått'];
            krevValg(ctx, felter.forstoEllerBurdeForstått.forståelse, [...base, 'forståelse']);
            if (felter.forstoEllerBurdeForstått.forståelse === 'forsto') {
                krevTekst(ctx, felter.forstoEllerBurdeForstått.forsto.begrunnelse, [
                    ...base,
                    'forsto',
                    'begrunnelse',
                ]);
                validerUnnlatelse(
                    ctx,
                    felter.forstoEllerBurdeForstått.forsto.unnlatelse,
                    [...base, 'forsto', 'unnlatelse'],
                    erUnder4xRettsgebyr
                );
            } else if (felter.forstoEllerBurdeForstått.forståelse === 'burdeForstått') {
                krevTekst(ctx, felter.forstoEllerBurdeForstått.burdeForstått.begrunnelse, [
                    ...base,
                    'burdeForstått',
                    'begrunnelse',
                ]);
                validerUnnlatelse(
                    ctx,
                    felter.forstoEllerBurdeForstått.burdeForstått.unnlatelse,
                    [...base, 'burdeForstått', 'unnlatelse'],
                    erUnder4xRettsgebyr
                );
            }
            break;
        }
        case 'forårsaket_av_mottaker': {
            const base = ['forårsaketAvMottaker'];
            krevValg(ctx, felter.forårsaketAvMottaker.aktsomhet, [...base, 'aktsomhet']);
            if (felter.forårsaketAvMottaker.aktsomhet === 'uaktsomt') {
                krevTekst(ctx, felter.forårsaketAvMottaker.uaktsomt.begrunnelse, [
                    ...base,
                    'uaktsomt',
                    'begrunnelse',
                ]);
                validerUnnlatelse(
                    ctx,
                    felter.forårsaketAvMottaker.uaktsomt.unnlatelse,
                    [...base, 'uaktsomt', 'unnlatelse'],
                    erUnder4xRettsgebyr
                );
            } else if (felter.forårsaketAvMottaker.aktsomhet === 'grovtUaktsomt') {
                krevTekst(ctx, felter.forårsaketAvMottaker.grovtUaktsomt.begrunnelse, [
                    ...base,
                    'grovtUaktsomt',
                    'begrunnelse',
                ]);
                validerSærligeGrunner(
                    ctx,
                    felter.forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner,
                    [...base, 'grovtUaktsomt', 'erDetSærligeGrunner']
                );
            } else if (felter.forårsaketAvMottaker.aktsomhet === 'forsettlig') {
                krevTekst(ctx, felter.forårsaketAvMottaker.forsettlig.begrunnelse, [
                    ...base,
                    'forsettlig',
                    'begrunnelse',
                ]);
            }
            break;
        }
        case 'god_tro': {
            const base = ['godTro'];
            krevTekst(ctx, felter.godTro.begrunnelse, [...base, 'begrunnelse']);
            krevValg(ctx, felter.godTro.beløpIBehold, [...base, 'beløpIBehold']);
            if (felter.godTro.beløpIBehold === 'ingenting') {
                krevTekst(ctx, felter.godTro.ingenting.begrunnelse, [
                    ...base,
                    'ingenting',
                    'begrunnelse',
                ]);
            } else if (felter.godTro.beløpIBehold === 'hele') {
                krevTekst(ctx, felter.godTro.hele.begrunnelse, [...base, 'hele', 'begrunnelse']);
                validerReduksjon(ctx, felter.godTro.hele, [...base, 'hele']);
            } else if (felter.godTro.beløpIBehold === 'deler') {
                krevBeløp(
                    ctx,
                    felter.godTro.deler.beløp,
                    [...base, 'deler', 'beløp'],
                    feilutbetaltBeløp
                );
                krevTekst(ctx, felter.godTro.deler.begrunnelse, [...base, 'deler', 'begrunnelse']);
                validerReduksjon(ctx, felter.godTro.deler, [...base, 'deler']);
            }
            break;
        }
    }
};

export const lagVilkårsvurderingSkjema = (
    erUnder4xRettsgebyr: boolean,
    feilutbetaltBeløp: number
): z.ZodType<VilkårsvurderingSkjemaFelter, VilkårsvurderingSkjemaFelter> =>
    vilkårsvurderingSkjema.superRefine((felter, ctx) =>
        validerFelter(felter, ctx, erUnder4xRettsgebyr, feilutbetaltBeløp)
    );

export type UnnlatelseNavnPrefix =
    | 'forstoEllerBurdeForstått.forsto.unnlatelse'
    | 'forstoEllerBurdeForstått.burdeForstått.unnlatelse'
    | 'forårsaketAvMottaker.uaktsomt.unnlatelse';

export type SærligeGrunnerNavnPrefix =
    | `${UnnlatelseNavnPrefix}.ikkeAktuelt.erDetSærligeGrunner`
    | `${UnnlatelseNavnPrefix}.skalIkkeUnnlates.erDetSærligeGrunner`
    | 'forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner';

export type ReduksjonNavnPrefix = 'godTro.hele' | 'godTro.deler';
