import { z } from 'zod';

import {
    zDelerWritable,
    zJaSaerligeGrunnerWritable,
    zSkalReduseresWritable,
} from '@/generated-new/zod.gen';

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

const prosentReduksjonSchema = zJaSaerligeGrunnerWritable.shape.prosentReduksjon
    .nullable()
    .catch(null);

const beløpIBeholdKronerSchema = zDelerWritable.shape.beløp.nullable().catch(null);

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
    erDetSaerligeGrunner: erDetSærligeGrunnerValgSchema,
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

const reduksjonValgSchema = z.enum(['skalReduseres', 'skalIkkeReduseres', '']).catch('');

const skalKrevesTilbakeBeløpSchema = zSkalReduseresWritable.shape.beløp.nullable().catch(null);

const reduksjonFelter: {
    reduksjon: typeof reduksjonValgSchema;
    skalReduseres: z.ZodObject<{
        beløp: typeof skalKrevesTilbakeBeløpSchema;
        relevans: typeof tekstliste;
        annetBegrunnelse: typeof tekst;
        begrunnelse: typeof tekst;
    }>;
    skalIkkeReduseres: z.ZodObject<{
        relevans: typeof tekstliste;
        annetBegrunnelse: typeof tekst;
        begrunnelse: typeof tekst;
    }>;
} = {
    reduksjon: reduksjonValgSchema,
    skalReduseres: z.object({
        beløp: skalKrevesTilbakeBeløpSchema,
        relevans: tekstliste,
        annetBegrunnelse: tekst,
        begrunnelse: tekst,
    }),
    skalIkkeReduseres: z.object({
        relevans: tekstliste,
        annetBegrunnelse: tekst,
        begrunnelse: tekst,
    }),
};

export const vilkårsvurderingSkjema = z.object({
    id: tekst,
    simulertBeløp: z.number().nullable().catch(null),
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
            beløp: beløpIBeholdKronerSchema,
            begrunnelse: tekst,
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
export type ReduksjonFelter = Pick<
    VilkårsvurderingSkjemaFelter['godTro']['hele'],
    'reduksjon' | 'skalReduseres' | 'skalIkkeReduseres'
>;

type FeltSti = (string | number)[];

/**
 * Native påkrevd-skjemaer. Feilmeldingene kommer fra det globale
 * `configureZod`-oppsettet (utils/zodConfig.ts): generiske tekst-/beløpsfelter
 * gir «Du må fylle inn en verdi», mens valg og avkrysning får en spesifikk
 * melding inline via `{ error }` – samme mønster som FaktaSkjema/VedtakSkjema.
 */
const påkrevdTekst = z.string().trim().min(1);
const påkrevdBeløp = z.number();
const påkrevdValg = z.string().min(1, { error: 'Du må gjøre et valg' });
const påkrevdMinstEtt = z.array(z.string()).min(1, { error: 'Du må velge minst ett alternativ' });

/**
 * Validerer `verdi` mot et native skjema og videresender eventuelle issues til
 * superRefine-konteksten med riktig feltsti. Meldingen er allerede løst av
 * `configureZod`/inline `{ error }` under parsingen.
 */
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

const krevBeløp = (ctx: z.core.$RefinementCtx, verdi: number | null, path: FeltSti): void =>
    valider(ctx, påkrevdBeløp, verdi, path);

const krevMinstEtt = (ctx: z.core.$RefinementCtx, verdier: string[], path: FeltSti): void =>
    valider(ctx, påkrevdMinstEtt, verdier, path);

const validerSærligeGrunner = (
    ctx: z.core.$RefinementCtx,
    felter: SærligeGrunnerFelter,
    basePath: FeltSti
): void => {
    krevValg(ctx, felter.erDetSaerligeGrunner, [...basePath, 'erDetSaerligeGrunner']);
    if (felter.erDetSaerligeGrunner === 'ja') {
        const path = [...basePath, 'jaSærligeGrunner'];
        krevMinstEtt(ctx, felter.jaSærligeGrunner.særligeGrunnerFor, [
            ...path,
            'særligeGrunnerFor',
        ]);
        if (felter.jaSærligeGrunner.særligeGrunnerFor.includes('ANNET')) {
            krevTekst(ctx, felter.jaSærligeGrunner.annetBegrunnelse, [...path, 'annetBegrunnelse']);
        }
        krevBeløp(ctx, felter.jaSærligeGrunner.prosentReduksjon, [...path, 'prosentReduksjon']);
        krevTekst(ctx, felter.jaSærligeGrunner.begrunnelse, [...path, 'begrunnelse']);
    } else if (felter.erDetSaerligeGrunner === 'nei') {
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
    krevValg(ctx, felter.reduksjon, [...basePath, 'reduksjon']);
    if (felter.reduksjon === 'skalReduseres') {
        const path = [...basePath, 'skalReduseres'];
        krevBeløp(ctx, felter.skalReduseres.beløp, [...path, 'beløp']);
        krevMinstEtt(ctx, felter.skalReduseres.relevans, [...path, 'relevans']);
        if (felter.skalReduseres.relevans.includes('ANNET')) {
            krevTekst(ctx, felter.skalReduseres.annetBegrunnelse, [...path, 'annetBegrunnelse']);
        }
        krevTekst(ctx, felter.skalReduseres.begrunnelse, [...path, 'begrunnelse']);
    } else if (felter.reduksjon === 'skalIkkeReduseres') {
        const path = [...basePath, 'skalIkkeReduseres'];
        krevMinstEtt(ctx, felter.skalIkkeReduseres.relevans, [...path, 'relevans']);
        if (felter.skalIkkeReduseres.relevans.includes('ANNET')) {
            krevTekst(ctx, felter.skalIkkeReduseres.annetBegrunnelse, [
                ...path,
                'annetBegrunnelse',
            ]);
        }
        krevTekst(ctx, felter.skalIkkeReduseres.begrunnelse, [...path, 'begrunnelse']);
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
    erUnder4xRettsgebyr: boolean
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
                krevBeløp(ctx, felter.godTro.deler.beløp, [...base, 'deler', 'beløp']);
                krevTekst(ctx, felter.godTro.deler.begrunnelse, [...base, 'deler', 'begrunnelse']);
                validerReduksjon(ctx, felter.godTro.deler, [...base, 'deler']);
            }
            break;
        }
    }
};

/**
 * Bygger valideringsskjemaet for en vilkårsvurderingsperiode. Kun feltene i den
 * aktive diskriminerte grenen er påkrevd. `erUnder4xRettsgebyr` avgjør om
 * unnlatelses-grenen (sjette avsnitt) valideres i stedet for særlige grunner.
 */
export const lagVilkårsvurderingSkjema = (
    erUnder4xRettsgebyr: boolean
): z.ZodType<VilkårsvurderingSkjemaFelter, VilkårsvurderingSkjemaFelter> =>
    vilkårsvurderingSkjema.superRefine((felter, ctx) =>
        validerFelter(felter, ctx, erUnder4xRettsgebyr)
    );

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
