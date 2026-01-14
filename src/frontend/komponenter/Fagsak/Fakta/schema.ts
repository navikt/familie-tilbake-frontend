import { z } from 'zod';

import { zOppdaget, zOppdaterFaktaPeriode, zVurdering } from '../../../generated-new/zod.gen';

export const oppdaterFaktaOmFeilutbetalingSchema = z.object({
    // TODO: Fjern dette etter skjema er oppdatert
    perioder: z.array(
        z.object({
            ...zOppdaterFaktaPeriode.shape,
            rettsligGrunnlag: z.array(
                z.object({
                    bestemmelse: z.string().nonempty(),
                    grunnlag: z.string().nonempty(),
                })
            ),
        })
    ),
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
