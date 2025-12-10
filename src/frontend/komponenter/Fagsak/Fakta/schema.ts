import { z } from 'zod';

import { zOppdagetDto, zOppdaterFaktaPeriodeDto } from '../../../generated/zod.gen';

export const oppdaterFaktaOmFeilutbetalingSchema = z.object({
    perioder: z.array(zOppdaterFaktaPeriodeDto),
    vurdering: z.object({
        årsak: z.string(),
        oppdaget: zOppdagetDto,
    }),
});
