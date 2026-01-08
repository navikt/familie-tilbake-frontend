import { z } from 'zod';

import { zOppdagetDto, zOppdaterFaktaPeriodeDto, zVurderingDto } from '../../../generated/zod.gen';

export const oppdaterFaktaOmFeilutbetalingSchema = z.object({
    // TODO: Fjern dette etter skjema er oppdatert
    perioder: z.array(
        z.object({
            ...zOppdaterFaktaPeriodeDto.shape,
            rettsligGrunnlag: z.array(
                z.object({
                    bestemmelse: z.string().nonempty(),
                    grunnlag: z.string().nonempty(),
                })
            ),
        })
    ),
    vurdering: z.object({
        ...zVurderingDto.shape,
        oppdaget: z.object({
            ...zOppdagetDto.shape,
            av: z.enum(['BRUKER', 'NAV'], {
                error: 'Du må enten velge Bruker eller Nav',
            }),
        }),
    }),
});

export type OppdaterFaktaOmFeilutbetalingSchemaDto = z.infer<
    typeof oppdaterFaktaOmFeilutbetalingSchema
>;
