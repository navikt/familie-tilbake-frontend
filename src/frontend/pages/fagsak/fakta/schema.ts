import { z } from 'zod';

import { zFritekst, zOppdaterFaktaOmFeilutbetaling, zVurdering } from '~/generated-new/zod.gen';

export const oppdaterFaktaOmFeilutbetalingSchema = z.object({
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

export type OppdaterFaktaOmFeilutbetalingSchema = z.infer<
    typeof oppdaterFaktaOmFeilutbetalingSchema
>;
