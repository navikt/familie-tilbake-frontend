import { z } from 'zod';

import { zFritekst, zOppdaterFaktaOmFeilutbetaling, zVurdering } from '@/generated-new/zod.gen';

const oppdaterFaktaOmFeilutbetalingSchema = z.object({
    ...zOppdaterFaktaOmFeilutbetaling.shape,
    vurdering: z.object({
        ...zVurdering.shape,
        oppdaget: z.object({
            av: z.enum(['BRUKER', 'NAV'], {
                error: 'Du må enten velge Bruker eller Nav',
            }),
            dato: z.iso.date(),
            beskrivelse: zFritekst,
        }),
    }),
});

export const lagOppdaterFaktaOmFeilutbetalingSchema = (
    usikker4xRettsgebyr: boolean
): z.ZodType<OppdaterFaktaOmFeilutbetalingSchema, OppdaterFaktaOmFeilutbetalingSchema> =>
    usikker4xRettsgebyr
        ? oppdaterFaktaOmFeilutbetalingSchema.extend({
              rettsgebyrÅrFraSaksbehandler: z.int({
                  error: 'Du må velge år for siste utbetaling',
              }),
          })
        : oppdaterFaktaOmFeilutbetalingSchema;

export type OppdaterFaktaOmFeilutbetalingSchema = z.infer<
    typeof oppdaterFaktaOmFeilutbetalingSchema
>;
