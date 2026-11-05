import type { AxiosError } from 'axios';
import type {
    BehandlingOppdaterRevurderingsarsakError,
    BehandlingOpprettRevurderingError,
    InstansEnum,
    Revurderingsinstans,
} from '@/generated-new';
import type { Revurderingsårsak } from '@/typer/revurdering';

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

export type Revurderingsfeil =
    | AxiosError<BehandlingOpprettRevurderingError | BehandlingOppdaterRevurderingsarsakError>
    | z.ZodError;

export const feilmeldingFraRevurdering = (
    error: Revurderingsfeil,
    standardtittel = 'Kunne ikke opprette revurderingen. Prøv igjen.'
): { tittel: string; melding?: string } => {
    if (error instanceof z.ZodError) {
        return { tittel: error.issues[0]?.message ?? 'Ugyldig svar fra serveren.' };
    }
    const feil = error.response?.data;
    return {
        tittel: feil?.tittel ?? standardtittel,
        melding: feil?.melding,
    };
};
