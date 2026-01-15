import { z } from 'zod';

import {
    zOppdaget,
    zOppdaterFaktaOmFeilutbetaling,
    zVurdering,
} from '../../../generated-new/zod.gen';

export const oppdaterFaktaOmFeilutbetalingSchema = z.object({
    ...zOppdaterFaktaOmFeilutbetaling.shape,
    vurdering: z.object({
        ...zVurdering.shape,
        oppdaget: z.object({
            ...zOppdaget.shape,
            av: z.enum(['BRUKER', 'NAV'], {
                error: 'Du må enten velge Bruker eller Nav',
            }),
        }),
    }),
});

export type OppdaterFaktaOmFeilutbetalingSchema = z.infer<
    typeof oppdaterFaktaOmFeilutbetalingSchema
>;
