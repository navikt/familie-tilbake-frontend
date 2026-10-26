import type {
    InstansEnum,
    Revurderingsinstans,
    TilbakekrevingRevurderingsarsak,
} from '@/generated-new';

import { z } from 'zod';

import {
    zEtterKlage,
    zFeilutbetaltBelopEndret,
    zForeldelse,
    zInstansEnum,
    zOpprettRevurderingResponse,
    zRevurderingsinstans,
    zUtenKlage,
} from '@/generated-new/zod.gen';

const begrunnelseSchema = z
    .string()
    .trim()
    .min(1, { error: 'Beskriv kort årsaken til revurderingen.' })
    .max(1000, { error: 'Begrunnelsen kan ikke være lengre enn 1000 tegn.' });

const instansFeilmelding = { error: 'Velg hvilken instans som har omgjort vedtaket.' };

export const revurderingSchema = z.discriminatedUnion(
    'revurderingsarsak',
    [
        zFeilutbetaltBelopEndret.extend({
            revurderingsarsak: z.literal('feilutbetalt_belop_endret'),
            instans: z.enum(zRevurderingsinstans.options, instansFeilmelding),
            begrunnelse: begrunnelseSchema,
        }),
        zEtterKlage.extend({
            revurderingsarsak: z.literal('etter_klage'),
            instans: z.enum(zRevurderingsinstans.options, instansFeilmelding),
            begrunnelse: begrunnelseSchema,
        }),
        zUtenKlage.extend({
            revurderingsarsak: z.literal('uten_klage'),
            instans: z.enum(zInstansEnum.options, instansFeilmelding),
            begrunnelse: begrunnelseSchema,
        }),
        zForeldelse.extend({
            revurderingsarsak: z.literal('foreldelse'),
            begrunnelse: begrunnelseSchema,
        }),
    ],
    { error: 'Velg årsak til revurderingen' }
);

type Revurderingsårsak = TilbakekrevingRevurderingsarsak['revurderingsarsak'];

export const årsaker: Record<Revurderingsårsak, string> = {
    feilutbetalt_belop_endret: 'Omgjøring av vedtaket om tilbakekreving fordi beløpet er endret',
    etter_klage: 'Omgjøring av vedtaket om tilbakekreving etter klage',
    uten_klage: 'Omgjøring av vedtaket om tilbakekreving uten klage (fvl. § 35)',
    foreldelse: 'Endring av kravet på grunn av foreldelse',
};

export const instansvalg: Record<
    Revurderingsårsak,
    ReadonlyArray<Revurderingsinstans | InstansEnum>
> = {
    feilutbetalt_belop_endret: zRevurderingsinstans.options,
    etter_klage: zRevurderingsinstans.options,
    uten_klage: zInstansEnum.options,
    foreldelse: [],
};

export const opprettRevurderingResponseSchema = zOpprettRevurderingResponse.extend({
    url: z.string().min(1, {
        error: 'Revurderingen ble opprettet, men svaret mangler URL til behandlingen.',
    }),
});
